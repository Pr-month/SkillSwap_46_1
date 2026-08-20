import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateResult } from 'typeorm';

import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/response.dto';
import { BusinessException } from '../common/errors/business.exception';
import { ConfigurationService } from '../module/configuration/configuration.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
    findAndCount: jest.Mock;
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
      findAndCount: jest.fn(),
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

    const expectedRelations = {
      city: true,
      skills: true,
      favoriteSkills: true,
      wantToLearn: { subcategories: true },
    };

    it('returns PaginatedResponseDto with default page=1, limit=20', async () => {
      const users = Array.from({ length: 5 }, (_, i) =>
        createUserWithId(i + 1),
      );
      usersRepository.findAndCount.mockResolvedValue([users, 5]);

      const query = new PaginationDto();
      const result = await service.findAll(query);

      expect(usersRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        relations: expectedRelations,
      });
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

    it('calls findAndCount with skip=10, take=10 for page=2, limit=10', async () => {
      const users = Array.from({ length: 10 }, (_, i) =>
        createUserWithId(i + 11),
      );
      usersRepository.findAndCount.mockResolvedValue([users, 21]);

      const query = new PaginationDto();
      query.page = 2;
      query.limit = 10;
      const result = await service.findAll(query);

      expect(usersRepository.findAndCount).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        relations: expectedRelations,
      });
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
      usersRepository.findAndCount.mockResolvedValue([[user], 1]);

      const query = new PaginationDto();
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
      usersRepository.findAndCount.mockResolvedValue([[], 5]);

      const query = new PaginationDto();
      query.page = 999;
      query.limit = 2;

      const promise = service.findAll(query);

      await expect(promise).rejects.toBeInstanceOf(BusinessException);
      await expect(promise).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('returns empty data when total === 0 without error', async () => {
      usersRepository.findAndCount.mockResolvedValue([[], 0]);

      const query = new PaginationDto();
      const result = await service.findAll(query);

      expect(result.data).toHaveLength(0);
      expect(result.totalPages).toBe(0);
      expect(result.page).toBe(1);
    });
  });
});
