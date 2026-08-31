import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Brackets, UpdateResult } from 'typeorm';

import { PaginatedResponseDto } from '../common/dto/response.dto';
import { BusinessException } from '../common/errors/business.exception';
import { ConfigurationService } from '../module/configuration/configuration.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersQueryDto } from './dto/users-query.dto';
import { User } from './entities/user.entity';
import { UserGender, UserRole } from './enums/user.enums';
import { UsersService } from './users.service';
import { CreateUserData } from './users.types';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
    update: jest.Mock;
    preload: jest.Mock;
  };

  const userId = 'ec9308f4-ef0a-44f5-b621-dab103719c62';
  const cityId = 'city-uuid-123';
  const createdAt = new Date('2026-08-01T10:00:00.000Z');
  const updatedAt = new Date('2026-08-02T10:00:00.000Z');

  const mockCity = {
    id: cityId,
    name: 'Москва',
    district: 'Центральный',
    subject: 'Москва',
    population: 12655050,
    lat: 55.7558,
    lon: 37.6173,
  };

  const createUser = (overrides: Partial<User> = {}): User =>
    Object.assign(new User(), {
      id: userId,
      email: 'user@example.com',
      password: 'password-hash',
      name: 'Иван Иванов',
      about: null,
      birthdate: new Date('1990-01-01'),
      cityId,
      city: mockCity,
      gender: UserGender.OTHER,
      avatar: null,
      favorites: [],
      skills: [],
      wantToLearn: [],
      favoriteSkills: [],
      role: UserRole.USER,
      refreshToken: null,
      createdAt,
      updatedAt,
      ...overrides,
    });

  beforeEach(async () => {
    usersRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      update: jest.fn(),
      preload: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
        {
          provide: ConfigurationService,
          useValue: { hashSalt: 'bcrypt-salt' },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates and saves a user', async () => {
    const createUserData: CreateUserData = {
      about: null,
      avatar: null,
      email: 'user@example.com',
      password: 'password-hash',
      name: 'Иван Иванов',
      birthdate: new Date('1990-01-01'),
      cityId,
      gender: UserGender.OTHER,
      role: UserRole.USER,
    };
    const user = createUser();
    usersRepository.create.mockReturnValue(user);
    usersRepository.save.mockResolvedValue(user);

    await expect(service.create(createUserData)).resolves.toBe(user);
    expect(usersRepository.create).toHaveBeenCalledWith(createUserData);
    expect(usersRepository.save).toHaveBeenCalledWith(user);
  });

  it('finds a user by email', async () => {
    const user = createUser();
    usersRepository.findOne.mockResolvedValue(user);

    await expect(service.findByEmail(user.email)).resolves.toBe(user);
    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { email: user.email },
      relations: { city: true },
    });
  });

  it('finds a user by id', async () => {
    const user = createUser();
    usersRepository.findOne.mockResolvedValue(user);

    await expect(service.findById(userId)).resolves.toBe(user);
    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { id: userId },
      relations: { city: true },
    });
  });

  it('updates the refresh token', async () => {
    usersRepository.update.mockResolvedValue({ affected: 1 } as UpdateResult);

    await expect(
      service.updateRefreshToken(userId, 'refresh-token'),
    ).resolves.toBeUndefined();
    expect(usersRepository.update).toHaveBeenCalledWith(
      { id: userId },
      { refreshToken: 'refresh-token' },
    );
  });

  it('throws when updating a missing user refresh token', async () => {
    usersRepository.update.mockResolvedValue({ affected: 0 } as UpdateResult);

    const promise = service.updateRefreshToken(userId, 'refresh-token');

    await expect(promise).rejects.toBeInstanceOf(BusinessException);
    await expect(promise).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('returns a profile without sensitive fields', async () => {
    usersRepository.findOne.mockResolvedValue(createUser());

    const profile = await service.getProfile(userId);

    expect(profile).toEqual({
      id: userId,
      email: 'user@example.com',
      name: 'Иван Иванов',
      birthDate: new Date('1990-01-01'),
      gender: UserGender.OTHER,
      city: mockCity,
      avatar: null,
      about: null,
      role: UserRole.USER,
      createdAt,
      updatedAt,
    });
    expect(profile).not.toHaveProperty('password');
    expect(profile).not.toHaveProperty('refreshToken');
  });

  it('throws when getting a missing user profile', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await expect(service.getProfile(userId)).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('updates and returns a user profile', async () => {
    const updateUserDto: UpdateUserDto = { name: 'Новое имя' };
    const existingUser = createUser();
    const updatedUser = createUser({ name: 'Новое имя' });

    usersRepository.findOne
      .mockResolvedValueOnce(existingUser)
      .mockResolvedValue(updatedUser);
    usersRepository.save.mockResolvedValue(updatedUser);

    const result = await service.updateProfile(userId, updateUserDto);

    expect(usersRepository.save).toHaveBeenCalled();
    expect(result.name).toBe('Новое имя');
  });

  it('throws when updating a missing user profile', async () => {
    usersRepository.preload.mockResolvedValue(undefined);

    await expect(
      service.updateProfile(userId, { name: 'Новое имя' }),
    ).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('changes the password when the current password is valid', async () => {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: 'old-password',
      newPassword: 'new-password',
    };
    usersRepository.findOne.mockResolvedValue(createUser());
    usersRepository.update.mockResolvedValue({ affected: 1 } as UpdateResult);
    (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as unknown as jest.Mock).mockResolvedValue(
      'new-password-hash',
    );

    await expect(
      service.changePassword(userId, changePasswordDto),
    ).resolves.toBeUndefined();
    expect(bcrypt.compare).toHaveBeenCalledWith(
      changePasswordDto.currentPassword,
      'password-hash',
    );
    expect(bcrypt.hash).toHaveBeenCalledWith(
      changePasswordDto.newPassword,
      'bcrypt-salt',
    );
    expect(usersRepository.update).toHaveBeenCalledWith(
      { id: userId },
      { password: 'new-password-hash' },
    );
  });

  it('rejects an invalid current password', async () => {
    usersRepository.findOne.mockResolvedValue(createUser());
    (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(false);

    await expect(
      service.changePassword(userId, {
        currentPassword: 'wrong-password',
        newPassword: 'new-password',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(usersRepository.update).not.toHaveBeenCalled();
  });

  describe('findAll', () => {
    const createUserWithId = (index: number): User =>
      Object.assign(new User(), {
        id: `user-uuid-${index}`,
        email: `user${index}@example.com`,
        password: 'password-hash',
        name: `User ${index}`,
        about: null,
        birthdate: new Date('1990-01-01'),
        cityId,
        city: mockCity,
        gender: UserGender.OTHER,
        avatar: null,
        favorites: [],
        skills: [],
        wantToLearn: [],
        favoriteSkills: [],
        role: UserRole.USER,
        refreshToken: null,
        createdAt: new Date(`2026-08-0${index}T10:00:00.000Z`),
        updatedAt: new Date(`2026-08-0${index}T10:00:00.000Z`),
      });

    it('returns PaginatedResponseDto with default page=1, limit=20', async () => {
      const users = Array.from({ length: 5 }, (_, i) =>
        createUserWithId(i + 1),
      );
      const builder = createQueryBuilderMock([users, 5]);
      usersRepository.createQueryBuilder.mockReturnValue(builder);

      const query = new UsersQueryDto();
      const result = await service.findAll(query);

      expect(usersRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(builder.skip).toHaveBeenCalledWith(0);
      expect(builder.take).toHaveBeenCalledWith(20);
      expect(result).toBeInstanceOf(PaginatedResponseDto);
      expect(result.data).toHaveLength(5);
      expect(result.data[0]).toEqual({
        id: 'user-uuid-1',
        email: 'user1@example.com',
        name: 'User 1',
        birthDate: new Date('1990-01-01'),
        gender: UserGender.OTHER,
        city: 'Москва',
        avatar: null,
        aboutMe: null,
        likesSkillsIds: [],
        userSkill: null,
        interestedSkillsSubcategoriesIds: [],
        createdAt: new Date('2026-08-01T10:00:00.000Z'),
        updatedAt: new Date('2026-08-01T10:00:00.000Z'),
      });
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('uses skip=10, take=10 for page=2, limit=10', async () => {
      const users = Array.from({ length: 10 }, (_, i) =>
        createUserWithId(i + 11),
      );
      const builder = createQueryBuilderMock([users, 21]);
      usersRepository.createQueryBuilder.mockReturnValue(builder);

      const query = new UsersQueryDto();
      query.page = 2;
      query.limit = 10;
      const result = await service.findAll(query);

      expect(builder.skip).toHaveBeenCalledWith(10);
      expect(builder.take).toHaveBeenCalledWith(10);
      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(3);
    });

    it('maps users with relations to profile list items', async () => {
      const skillId = 'skill-uuid-1';
      const subcategoryId = 'subcategory-uuid-1';
      const user = createUserWithId(1);
      Object.assign(user, {
        skills: [{ id: skillId }],
        favoriteSkills: [{ id: skillId }],
        wantToLearn: [
          { id: 'category-uuid-1', subcategories: [{ id: subcategoryId }] },
        ],
      });
      const builder = createQueryBuilderMock([[user], 1]);
      usersRepository.createQueryBuilder.mockReturnValue(builder);

      const query = new UsersQueryDto();
      const result = await service.findAll(query);

      expect(result.data[0]).toMatchObject({
        userSkill: skillId,
        likesSkillsIds: [skillId],
        interestedSkillsSubcategoriesIds: [subcategoryId],
        city: 'Москва',
        birthDate: new Date('1990-01-01'),
      });
    });

    it('throws 404 when page > totalPages and total > 0', async () => {
      const builder = createQueryBuilderMock([[], 5]);
      usersRepository.createQueryBuilder.mockReturnValue(builder);

      const query = new UsersQueryDto();
      query.page = 999;
      query.limit = 2;

      const promise = service.findAll(query);

      await expect(promise).rejects.toBeInstanceOf(BusinessException);
      await expect(promise).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('returns empty data when total === 0 without error', async () => {
      const builder = createQueryBuilderMock([[], 0]);
      usersRepository.createQueryBuilder.mockReturnValue(builder);

      const query = new UsersQueryDto();
      const result = await service.findAll(query);

      expect(result.data).toHaveLength(0);
      expect(result.totalPages).toBe(0);
      expect(result.page).toBe(1);
    });

    it('applies search filter by name/email/skill', async () => {
      const builder = createQueryBuilderMock([[], 0]);
      usersRepository.createQueryBuilder.mockReturnValue(builder);

      const query = Object.assign(new UsersQueryDto(), { search: 'иван' });
      await service.findAll(query);

      expect(builder.andWhere).toHaveBeenCalledTimes(1);
      const [condition, params] = builder.andWhere.mock.calls[0];
      expect(condition).toBeInstanceOf(Brackets);
      expect(params).toEqual({ search: '%иван%' });
    });

    it('applies gender filter case-insensitively', async () => {
      const builder = createQueryBuilderMock([[], 0]);
      usersRepository.createQueryBuilder.mockReturnValue(builder);

      const query = Object.assign(new UsersQueryDto(), { gender: 'male' });
      await service.findAll(query);

      expect(builder.andWhere).toHaveBeenCalledTimes(1);
      const [condition, params] = builder.andWhere.mock.calls[0];
      expect(condition).toEqual('CAST(user.gender AS text) = :gender');
      expect(params).toEqual({ gender: 'MALE' });
    });

    it('ignores gender filter when value is "all"', async () => {
      const builder = createQueryBuilderMock([[], 0]);
      usersRepository.createQueryBuilder.mockReturnValue(builder);

      const query = Object.assign(new UsersQueryDto(), { gender: 'all' });
      await service.findAll(query);

      expect(builder.andWhere).not.toHaveBeenCalled();
    });

    it('applies cities filter', async () => {
      const builder = createQueryBuilderMock([[], 0]);
      usersRepository.createQueryBuilder.mockReturnValue(builder);

      const query = Object.assign(new UsersQueryDto(), {
        cities: ['Москва', 'Казань'],
      });
      await service.findAll(query);

      expect(builder.andWhere).toHaveBeenCalledTimes(1);
      const [condition, params] = builder.andWhere.mock.calls[0];
      expect(condition).toEqual('city.name IN (:...cities)');
      expect(params).toEqual({ cities: ['Москва', 'Казань'] });
    });

    it('applies subCategoryIds filter for can-teach', async () => {
      const builder = createQueryBuilderMock([[], 0]);
      usersRepository.createQueryBuilder.mockReturnValue(builder);

      const query = Object.assign(new UsersQueryDto(), {
        subCategoryIds: ['sub-1', 'sub-2'],
        skillOption: 'can-teach',
      });
      await service.findAll(query);

      expect(builder.andWhere).toHaveBeenCalledTimes(1);
      const [condition, params] = builder.andWhere.mock.calls[0];
      expect(condition).toEqual(
        '"userSkill"."subcategory_id"::text IN (:...subCategoryIds)',
      );
      expect(params).toEqual({ subCategoryIds: ['sub-1', 'sub-2'] });
    });

    it('applies subCategoryIds filter for want-to-learn', async () => {
      const builder = createQueryBuilderMock([[], 0]);
      usersRepository.createQueryBuilder.mockReturnValue(builder);

      const query = Object.assign(new UsersQueryDto(), {
        subCategoryIds: ['sub-1'],
        skillOption: 'want-to-learn',
      });
      await service.findAll(query);

      expect(builder.andWhere).toHaveBeenCalledTimes(1);
      const [condition, params] = builder.andWhere.mock.calls[0];
      expect(condition).toEqual(
        '"wantToLearnSubcategory"."id"::text IN (:...subCategoryIds)',
      );
      expect(params).toEqual({ subCategoryIds: ['sub-1'] });
    });

    it('applies subCategoryIds filter for skillOption=all as OR', async () => {
      const builder = createQueryBuilderMock([[], 0]);
      usersRepository.createQueryBuilder.mockReturnValue(builder);

      const query = Object.assign(new UsersQueryDto(), {
        subCategoryIds: ['sub-1'],
        skillOption: 'all',
      });
      await service.findAll(query);

      expect(builder.andWhere).toHaveBeenCalledTimes(1);
      const [condition, params] = builder.andWhere.mock.calls[0];
      expect(condition).toBeInstanceOf(Brackets);
      expect(params).toEqual({ subCategoryIds: ['sub-1'] });
    });

    it('combines filters with pagination', async () => {
      const users = Array.from({ length: 2 }, (_, i) =>
        createUserWithId(i + 1),
      );
      const builder = createQueryBuilderMock([users, 6]);
      usersRepository.createQueryBuilder.mockReturnValue(builder);

      const query = Object.assign(new UsersQueryDto(), {
        search: 'ivan',
        gender: 'female',
        cities: ['Москва'],
        subCategoryIds: ['sub-1'],
        skillOption: 'can-teach',
        page: 2,
        limit: 2,
      });
      await service.findAll(query);

      expect(builder.andWhere).toHaveBeenCalledTimes(4);
      expect(builder.skip).toHaveBeenCalledWith(2);
      expect(builder.take).toHaveBeenCalledWith(2);
    });
  });
});

type MockedQueryBuilder = {
  leftJoinAndSelect: jest.Mock;
  orderBy: jest.Mock;
  skip: jest.Mock;
  take: jest.Mock;
  andWhere: jest.Mock;
  getManyAndCount: jest.Mock;
};

function createQueryBuilderMock(result: [User[], number]): MockedQueryBuilder {
  const builder: MockedQueryBuilder = {
    leftJoinAndSelect: jest.fn(),
    orderBy: jest.fn(),
    skip: jest.fn(),
    take: jest.fn(),
    andWhere: jest.fn(),
    getManyAndCount: jest.fn().mockResolvedValue(result),
  };

  Object.values(builder).forEach((method) => {
    if (method !== builder.getManyAndCount) method.mockReturnValue(builder);
  });

  return builder;
}
