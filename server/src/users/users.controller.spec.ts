import { Test, TestingModule } from '@nestjs/testing';

import { RequestWithUser } from '../auth/auth.types';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserGender, UserRole } from './enums/user.enums';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    findAll: jest.Mock;
    getProfile: jest.Mock;
    updateProfile: jest.Mock;
    changePassword: jest.Mock;
  };

  const userId = 'ec9308f4-ef0a-44f5-b621-dab103719c62';
  const request = {
    user: {
      id: userId,
      email: 'user@example.com',
    },
  } as unknown as RequestWithUser;
  const profile = {
    id: userId,
    email: 'user@example.com',
    name: 'Иван Иванов',
    birthDate: new Date('1990-01-01'),
    gender: UserGender.OTHER,
    city: 'Москва',
    avatar: null,
    about: null,
    role: UserRole.USER,
    createdAt: new Date('2026-08-01T10:00:00.000Z'),
    updatedAt: new Date('2026-08-02T10:00:00.000Z'),
  };

  beforeEach(async () => {
    usersService = {
      findAll: jest.fn(),
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns the current user profile', async () => {
    usersService.getProfile.mockResolvedValue(profile);

    await expect(controller.getMe(request)).resolves.toBe(profile);
    expect(usersService.getProfile).toHaveBeenCalledWith(userId);
  });

  it('returns a user profile by id', async () => {
    usersService.getProfile.mockResolvedValue(profile);

    await expect(controller.getById(userId)).resolves.toBe(profile);
    expect(usersService.getProfile).toHaveBeenCalledWith(userId);
  });

  it('updates the current user profile', async () => {
    const updateUserDto: UpdateUserDto = { name: 'Новое имя' };
    usersService.updateProfile.mockResolvedValue({
      ...profile,
      ...updateUserDto,
    });

    await expect(
      controller.updateMe(request, updateUserDto),
    ).resolves.toMatchObject(updateUserDto);
    expect(usersService.updateProfile).toHaveBeenCalledWith(
      userId,
      updateUserDto,
    );
  });

  it('changes the current user password', async () => {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: 'old-password',
      newPassword: 'new-password',
    };
    usersService.changePassword.mockResolvedValue(undefined);

    await expect(
      controller.changePassword(request, changePasswordDto),
    ).resolves.toMatchObject({ status: true });
    expect(usersService.changePassword).toHaveBeenCalledWith(
      userId,
      changePasswordDto,
    );
  });

  it('findAll calls usersService.findAll with query and returns result', async () => {
    const query = { page: 1, limit: 20, skip: 0, search: '' };
    const paginatedResult = {
      data: [profile],
      page: 1,
      totalPages: 1,
    };
    usersService.findAll.mockResolvedValue(paginatedResult);

    await expect(controller.findAll(query)).resolves.toBe(paginatedResult);
    expect(usersService.findAll).toHaveBeenCalledWith(query);
  });
});
