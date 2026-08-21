import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

import { BusinessException } from '../common/errors/business.exception';
import { exceptionCodes } from '../common/errors/error-codes';
import { ConfigurationService } from '../module/configuration/configuration.service';
import { UserGender, UserRole } from '../users/enums/user.enums';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

jest.mock('bcrypt');

const mockedBcrypt = bcrypt;

describe('AuthService', () => {
  let service: AuthService;

  const cityId = 'city-uuid-123';
  const mockCity = {
    id: cityId,
    name: 'Москва',
    district: 'Центральный',
    subject: 'Москва',
    population: 12655050,
    lat: 55.7558,
    lon: 37.6173,
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateRefreshToken: jest.fn(),
    updatePassword: jest.fn(),
    clearRefreshToken: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    hashSalt: 10,
    jwtAccessExpiresIn: '15m',
    jwtRefreshExpiresIn: '7d',
    jwtRefreshSecret: 'test-secret',
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigurationService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Иван Петров',
      birthdate: '1990-01-01',
      gender: UserGender.MALE,
      cityId,
      avatar: 'https://example.com/avatar.jpg',
    };

    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      name: 'Иван Петров',
      birthdate: new Date('1990-01-01'),
      gender: UserGender.MALE,
      cityId,
      city: mockCity,
      avatar: 'https://example.com/avatar.jpg',
      role: UserRole.USER,
    };

    beforeEach(() => {
      mockedBcrypt.hash.mockResolvedValue('hashed-password' as never);
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
    });

    it('should successfully register a new user and set cookies', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.register(registerDto, mockResponse);

      expect(result).toEqual(mockUser);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockUsersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          password: 'hashed-password',
          name: registerDto.name,
          birthdate: new Date(registerDto.birthdate),
          gender: registerDto.gender,
          cityId: registerDto.cityId,
          avatar: registerDto.avatar,
          role: UserRole.USER,
          about: null,
          wantToLearn: [],
          skills: [],
        }),
      );
      expect(mockUsersService.create).toHaveBeenCalled();

      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        'user-id',
        'refresh-token',
      );

      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
    });

    it('should throw ConflictException if user already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'existing-user-id',
        email: registerDto.email,
      });

      await expect(service.register(registerDto, mockResponse)).rejects.toThrow(
        BusinessException,
      );

      expect(mockUsersService.create).not.toHaveBeenCalled();
      expect(mockUsersService.create).not.toHaveBeenCalled();
      expect(mockUsersService.updateRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashed-password',
      refreshToken: 'refresh-token',
      name: 'Иван Петров',
    };

    it('should return { id, email } if credentials are valid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual({
        id: 'user-id',
        email: 'test@example.com',
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashed-password',
      );
    });

    it('should return null if user does not exist', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'unknown@example.com',
        'password123',
      );

      expect(result).toBeNull();
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null if password is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUser(
        'test@example.com',
        'wrong-password',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const mockUserPayload = {
      id: 'user-id',
      email: 'test@example.com',
    };

    const mockFullUser = {
      ...mockUserPayload,
      name: 'Иван Петров',
    };

    beforeEach(() => {
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);
      mockUsersService.findById.mockResolvedValue(mockFullUser);
    });

    it('should successfully login user, set cookies, and return full user', async () => {
      const result = await service.login(mockUserPayload, mockResponse);

      expect(result).toEqual(mockFullUser);

      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        'user-id',
        'refresh-token',
      );

      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);

      expect(mockUsersService.findById).toHaveBeenCalledWith('user-id');
    });
  });

  describe('logout', () => {
    it('should clear refresh token in DB and clear cookies', async () => {
      mockUsersService.clearRefreshToken.mockResolvedValue(undefined);

      const result = await service.logout('user-id', mockResponse);

      expect(result).toEqual({
        message: 'Успешный выход',
      });

      expect(mockUsersService.clearRefreshToken).toHaveBeenCalledWith(
        'user-id',
      );

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('accessToken');

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('checkUser', () => {
    it('should return available if email is free', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.checkUser('new@example.com');

      expect(result).toEqual({ available: true });
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'new@example.com',
      );
    });

    it('should throw ConflictException if user already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'existing-user-id',
        email: 'test@example.com',
      });

      await expect(service.checkUser('test@example.com')).rejects.toThrow(
        BusinessException,
      );
    });
  });

  describe('getProfile', () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      name: 'Иван Петров',
      birthdate: new Date('1990-01-01'),
      gender: UserGender.MALE,
      cityId,
      city: mockCity,
      avatar: 'https://example.com/avatar.jpg',
      about: 'О себе',
    };

    it('should successfully return user profile', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-id');

      expect(result).toEqual(mockUser);

      expect(mockUsersService.findById).toHaveBeenCalledWith('user-id');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.findById.mockRejectedValue(
        new BusinessException(exceptionCodes.users.notFound, 404),
      );

      await expect(service.getProfile('invalid-id')).rejects.toThrow(
        BusinessException,
      );
    });
  });

  describe('updatePassword', () => {
    const updatePasswordDto = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword123',
    };

    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashed-old-password',
    };

    beforeEach(() => {
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('hashed-new-password' as never);
      mockUsersService.updatePassword.mockResolvedValue(undefined);
    });

    it('should successfully update password when current password is valid', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      mockUsersService.updatePassword.mockResolvedValue(undefined);

      const result = await service.updatePassword('user-id', updatePasswordDto);

      expect(result).toEqual({
        message: 'Пароль успешно обновлен',
      });

      expect(mockUsersService.findById).toHaveBeenCalledWith('user-id');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'oldPassword123',
        'hashed-old-password',
      );

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);

      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(
        'user-id',
        'hashed-new-password',
      );
    });

    it('should throw BusinessException if user not found', async () => {
      mockUsersService.findById.mockRejectedValue(
        new BusinessException(exceptionCodes.users.notFound, 404),
      );

      expect(bcrypt.hash).not.toHaveBeenCalled();

      expect(mockUsersService.updatePassword).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(
        service.updatePassword('invalid-id', updatePasswordDto),
      ).rejects.toThrow(BusinessException);
      expect(mockUsersService.updatePassword).not.toHaveBeenCalled();
    });
  });
});
