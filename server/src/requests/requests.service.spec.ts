import { HttpStatus } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { exceptionCodes } from '../common/errors/error-codes';
import { Skill } from '../skills/entities/skills.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user.enums';
import { Request } from './entities/request.entity';
import { RequestStatus } from './enums/request-status.enum';
import { RequestsService } from './requests.service';

describe('RequestsService', () => {
  let service: RequestsService;
  let requestsRepository: jest.Mocked<Repository<Request>>;
  let skillsRepository: jest.Mocked<Repository<Skill>>;
  let usersRepository: jest.Mocked<Repository<User>>;
  let dataSource: jest.Mocked<DataSource>;
  let manager: jest.Mocked<EntityManager>;

  beforeEach(() => {
    requestsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<Repository<Request>>;
    skillsRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Skill>>;
    usersRepository = {
      findOneBy: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;
    manager = {
      save: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>;
    dataSource = {
      transaction: jest.fn((callback) => callback(manager)),
    } as unknown as jest.Mocked<DataSource>;

    service = new RequestsService(
      requestsRepository,
      skillsRepository,
      usersRepository,
      dataSource,
    );
  });

  it('определяет получателя по запрашиваемому навыку', async () => {
    const offeredSkill = { id: 'offered-id', ownerId: 'sender-id' } as Skill;
    const requestedSkill = {
      id: 'requested-id',
      ownerId: 'receiver-id',
    } as Skill;
    const request = { id: 'request-id' } as Request;
    skillsRepository.findOne
      .mockResolvedValueOnce(offeredSkill)
      .mockResolvedValueOnce(requestedSkill);
    requestsRepository.create.mockReturnValue(request);
    requestsRepository.save.mockResolvedValue(request);

    await expect(
      service.create('sender-id', {
        offeredSkillId: offeredSkill.id,
        requestedSkillId: requestedSkill.id,
      }),
    ).resolves.toBe(request);
    expect(requestsRepository.create).toHaveBeenCalledWith({
      sender: { id: 'sender-id' },
      receiver: { id: 'receiver-id' },
      offeredSkill,
      requestedSkill,
    });
  });

  it('запрещает предлагать чужой навык', async () => {
    skillsRepository.findOne
      .mockResolvedValueOnce({ ownerId: 'another-owner' } as Skill)
      .mockResolvedValueOnce({ ownerId: 'receiver-id' } as Skill);

    await expect(
      service.create('sender-id', {
        offeredSkillId: 'offered-id',
        requestedSkillId: 'requested-id',
      }),
    ).rejects.toMatchObject({
      code: exceptionCodes.requests.accessDenied,
      status: HttpStatus.FORBIDDEN,
    });
  });

  it('позволяет получателю принять активную заявку и помечает её прочитанной', async () => {
    const request = {
      id: 'request-id',
      sender: { id: 'sender-id' },
      receiver: { id: 'receiver-id' },
      offeredSkill: { id: 'offered-id', ownerId: 'sender-id' },
      requestedSkill: { id: 'requested-id', ownerId: 'receiver-id' },
      status: RequestStatus.PENDING,
      isRead: false,
    } as Request;
    requestsRepository.findOne.mockResolvedValue(request);
    manager.save.mockResolvedValue(request);

    const result = await service.update('request-id', 'receiver-id', {
      status: RequestStatus.ACCEPTED,
    });

    expect(result.status).toBe(RequestStatus.ACCEPTED);
    expect(result.isRead).toBe(true);
    expect(request.offeredSkill.ownerId).toBe('receiver-id');
    expect(request.requestedSkill.ownerId).toBe('sender-id');
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(manager.save).toHaveBeenNthCalledWith(1, Skill, [
      request.offeredSkill,
      request.requestedSkill,
    ]);
    expect(manager.save).toHaveBeenNthCalledWith(2, Request, request);
  });

  it('запрещает менять завершённую заявку', async () => {
    requestsRepository.findOne.mockResolvedValue({
      receiver: { id: 'receiver-id' },
      status: RequestStatus.REJECTED,
    } as Request);

    await expect(
      service.update('request-id', 'receiver-id', {
        status: RequestStatus.ACCEPTED,
      }),
    ).rejects.toMatchObject({
      code: exceptionCodes.requests.invalidStatus,
      status: HttpStatus.CONFLICT,
    });
  });

  it('позволяет администратору удалить чужую заявку', async () => {
    const request = {
      sender: { id: 'sender-id' },
    } as Request;
    requestsRepository.findOne.mockResolvedValue(request);
    usersRepository.findOneBy.mockResolvedValue({
      role: UserRole.ADMIN,
    } as User);

    await service.remove('request-id', 'admin-id');

    expect(requestsRepository.remove).toHaveBeenCalledWith(request);
  });
});
