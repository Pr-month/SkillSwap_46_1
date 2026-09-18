import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { BusinessException } from '../common/errors/business.exception';
import { exceptionCodes } from '../common/errors/error-codes';
import { NotificationEvent } from '../gateway/gateway.types';
import { NotificationsGateway } from '../gateway/notifications.gateway';
import { Skill } from '../skills/entities/skills.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user.enums';
import { CreateRequestDto, UpdateRequestDto } from './dto';
import { Request } from './entities/request.entity';
import { RequestStatus } from './enums/request-status.enum';
import { PUBLIC_REQUEST_FIELDS, REQUEST_RELATIONS } from './requests.select';

const ACTIVE_STATUSES = [RequestStatus.PENDING, RequestStatus.IN_PROGRESS];

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(senderId: string, dto: CreateRequestDto): Promise<Request> {
    const [offeredSkill, requestedSkill] = await Promise.all([
      this.findSkill(dto.offeredSkillId),
      this.findSkill(dto.requestedSkillId),
    ]);

    if (offeredSkill.ownerId !== senderId) {
      throw new BusinessException(
        exceptionCodes.requests.accessDenied,
        HttpStatus.FORBIDDEN,
      );
    }

    if (requestedSkill.ownerId === senderId) {
      throw new BusinessException(
        exceptionCodes.requests.selfRequest,
        HttpStatus.BAD_REQUEST,
      );
    }

    const request = this.requestsRepository.create({
      sender: { id: senderId } as User,
      receiver: { id: requestedSkill.ownerId } as User,
      offeredSkill,
      requestedSkill,
    });

    const savedRequest = await this.requestsRepository.save(request);

    this.notificationsGateway.notifyUser(
      requestedSkill.ownerId,
      NotificationEvent.NewRequest,
      {
        requestId: savedRequest.id,
        message: 'Вам поступила новая заявка на обмен',
        skillTitle: requestedSkill.title,
        fromUserId: senderId,
      },
    );

    return savedRequest;
  }

  findIncoming(userId: string): Promise<Request[]> {
    return this.requestsRepository.find({
      where: {
        receiver: { id: userId },
        status: In(ACTIVE_STATUSES),
      },
      relations: REQUEST_RELATIONS,
      select: PUBLIC_REQUEST_FIELDS,
      order: { createdAt: 'DESC' },
    });
  }

  findOutgoing(userId: string): Promise<Request[]> {
    return this.requestsRepository.find({
      where: {
        sender: { id: userId },
        status: In(ACTIVE_STATUSES),
      },
      relations: REQUEST_RELATIONS,
      select: PUBLIC_REQUEST_FIELDS,
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    receiverId: string,
    dto: UpdateRequestDto,
  ): Promise<Request> {
    const request = await this.findOne(id);

    if (request.receiver.id !== receiverId) {
      throw new BusinessException(
        exceptionCodes.requests.accessDenied,
        HttpStatus.FORBIDDEN,
      );
    }

    if (!ACTIVE_STATUSES.includes(request.status)) {
      throw new BusinessException(
        exceptionCodes.requests.invalidStatus,
        HttpStatus.CONFLICT,
      );
    }

    request.status = dto.status;
    request.isRead = true;

    if (dto.status === RequestStatus.ACCEPTED) {
      request.offeredSkill.ownerId = request.receiver.id;
      request.offeredSkill.owner = request.receiver;
      request.requestedSkill.ownerId = request.sender.id;
      request.requestedSkill.owner = request.sender;

      return this.dataSource.transaction(async (manager) => {
        await manager.save(Skill, [
          request.offeredSkill,
          request.requestedSkill,
        ]);
        return manager.save(Request, request);
      });
    }

    return this.requestsRepository.save(request);
  }

  async remove(id: string, userId: string): Promise<void> {
    const [request, user] = await Promise.all([
      this.findOne(id),
      this.usersRepository.findOneBy({ id: userId }),
    ]);

    if (request.sender.id !== userId && user?.role !== UserRole.ADMIN) {
      throw new BusinessException(
        exceptionCodes.requests.accessDenied,
        HttpStatus.FORBIDDEN,
      );
    }

    await this.requestsRepository.remove(request);
  }

  private async findOne(id: string): Promise<Request> {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: REQUEST_RELATIONS,
      select: PUBLIC_REQUEST_FIELDS,
    });

    if (!request) {
      throw new BusinessException(
        exceptionCodes.requests.notFound,
        HttpStatus.NOT_FOUND,
      );
    }

    return request;
  }

  private async findSkill(id: string): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
    });

    if (!skill) {
      throw new BusinessException(
        exceptionCodes.skills.notFound,
        HttpStatus.NOT_FOUND,
      );
    }

    return skill;
  }
}
