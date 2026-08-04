import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { BusinessException } from '../common/errors/business.exception';
import { exceptionCodes } from '../common/errors/error-codes';
import { Skill } from '../skills/entities/skills.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user.enums';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Request } from './entities/request.entity';
import { RequestStatus } from './enums/request-status.enum';

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

    return this.requestsRepository.save(request);
  }

  findIncoming(userId: string): Promise<Request[]> {
    return this.requestsRepository.find({
      where: {
        receiver: { id: userId },
        status: In(ACTIVE_STATUSES),
      },
      relations: this.relations,
      select: this.publicRequestFields,
      order: { createdAt: 'DESC' },
    });
  }

  findOutgoing(userId: string): Promise<Request[]> {
    return this.requestsRepository.find({
      where: {
        sender: { id: userId },
        status: In(ACTIVE_STATUSES),
      },
      relations: this.relations,
      select: this.publicRequestFields,
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
      relations: this.relations,
      select: this.publicRequestFields,
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

  private readonly relations = {
    sender: true,
    receiver: true,
    offeredSkill: true,
    requestedSkill: true,
  } as const;

  private readonly publicRequestFields = {
    id: true,
    createdAt: true,
    status: true,
    isRead: true,
    sender: {
      id: true,
      name: true,
      about: true,
      birthdate: true,
      city: true,
      gender: true,
      avatar: true,
    },
    receiver: {
      id: true,
      name: true,
      about: true,
      birthdate: true,
      city: true,
      gender: true,
      avatar: true,
    },
    offeredSkill: {
      id: true,
      title: true,
      description: true,
      images: true,
      categoryId: true,
      subcategoryId: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
    },
    requestedSkill: {
      id: true,
      title: true,
      description: true,
      images: true,
      categoryId: true,
      subcategoryId: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
    },
  } as const;
}
