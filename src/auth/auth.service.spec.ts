import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { BusinessException } from '../common/errors/business.exception';
import { exceptionCodes } from '../common/errors/error-codes';
import { ConfigurationService } from '../module/configuration/configuration.service';
import { UserGender, UserRole } from '../users/enums/user.enums';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateRefreshToken: jest.fn(),
    updatePassword: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    hashSalt: 10,
  };

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
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Иван Петров',
      birthdate: '1990-01-01',
      gender: UserGender.MALE,
      city: 'Москва',
      avatar: 'https://example.com/avatar.jpg',
    };

    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashed-password',
      name: 'Иван Петров',
      birthdate: new Date('1990-01-01'),
      gender: UserGender.MALE,
      city: 'Москва',
      avatar: 'https://example.com/avatar.jpg',
      role: UserRole.USER,
    };

    beforeEach(() => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);
      mockJwtService.signAsync.mockResolvedValueOnce('access-token');
      mockJwtService.signAsync.mockResolvedValueOnce('refresh-token');
    });

    it('should successfully register a new user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.register(registerDto);

      expect(result.status).toBe(true);
      expect(result.access_token).toBe('access-token');
      expect(result.refresh_token).toBe('refresh-token');
      expect(result.user.email).toBe('test@example.com');

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUsersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'hashed-password',
          name: 'Иван Петров',
          role: UserRole.USER,
        }),
      );
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        'user-id',
        'refresh-token',
      );
    });

    it('should throw BusinessException if user already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        BusinessException,
      );

      await expect(service.register(registerDto)).rejects.toThrow(
        new BusinessException(exceptionCodes.users.alreadyExists, 409),
      );

      expect(mockUsersService.create).not.toHaveBeenCalled();
    });
  });

  describe('checkUser', () => {
    it('should return exists: true if user exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'user-id' });

      const result = await service.checkUser('test@example.com');

      expect(result).toEqual({
        exists: true,
        email: 'test@example.com',
      });
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('should return exists: false if user does not exist', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.checkUser('unknown@example.com');

      expect(result).toEqual({
        exists: false,
        email: 'unknown@example.com',
      });
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

    it('should return user without password if credentials are valid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toBeDefined();
      expect(result.id).toBe('user-id');
      expect(result.email).toBe('test@example.com');
      expect(result.password).toBeUndefined();
      expect(result.refreshToken).toBeUndefined();
    });

    it('should return null if user does not exist', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'unknown@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser(
        'test@example.com',
        'wrong-password',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      name: 'Иван Петров',
    };

    beforeEach(() => {
      mockJwtService.signAsync.mockResolvedValueOnce('access-token');
      mockJwtService.signAsync.mockResolvedValueOnce('refresh-token');
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);
    });

    it('should successfully login user and return tokens', async () => {
      const result = await service.login(mockUser);

      expect(result.status).toBe(true);
      expect(result.access_token).toBe('access-token');
      expect(result.refresh_token).toBe('refresh-token');
      expect(result.user).toEqual(mockUser);

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        'user-id',
        'refresh-token',
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
      city: 'Москва',
      avatar: 'https://example.com/avatar.jpg',
      about: 'О себе',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    it('should successfully return user profile', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-id');

      expect(result.status).toBe(true);
      expect(result.data.id).toBe('user-id');
      expect(result.data.email).toBe('test@example.com');
      expect(result.data.birthDate).toEqual(new Date('1990-01-01'));
      expect(result.data.about).toBe('О себе');

      expect(mockUsersService.findById).toHaveBeenCalledWith('user-id');
    });

    it('should throw BusinessException if user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.getProfile('invalid-id')).rejects.toThrow(
        BusinessException,
      );

      await expect(service.getProfile('invalid-id')).rejects.toThrow(
        new BusinessException(exceptionCodes.users.notFound, 404),
      );
    });
  });

  describe('updatePassword', () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
    };

    const updatePasswordDto = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword123',
    };

    beforeEach(() => {
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('hashed-new-password' as never);
      mockUsersService.updatePassword.mockResolvedValue(undefined);
    });

    it('should successfully update password', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await service.updatePassword('user-id', updatePasswordDto);

      expect(result.status).toBe(true);
      expect(result.message).toBe('Пароль успешно обновлен');

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(
        'user-id',
        'hashed-new-password',
      );
    });

    it('should throw BusinessException if user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(
        service.updatePassword('invalid-id', updatePasswordDto),
      ).rejects.toThrow(BusinessException);

      await expect(
        service.updatePassword('invalid-id', updatePasswordDto),
      ).rejects.toThrow(
        new BusinessException(exceptionCodes.users.notFound, 404),
      );

      expect(mockUsersService.updatePassword).not.toHaveBeenCalled();
    });
  });

  describe('refreshTokens', () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      refreshToken: 'old-refresh-token',
    };

    beforeEach(() => {
      mockJwtService.signAsync.mockResolvedValueOnce('new-access-token');
      mockJwtService.signAsync.mockResolvedValueOnce('new-refresh-token');
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);
    });

    it('should successfully refresh tokens', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await service.refreshTokens('user-id');

      expect(result.status).toBe(true);
      expect(result.access_token).toBe('new-access-token');
      expect(result.refresh_token).toBe('new-refresh-token');

      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        'user-id',
        'new-refresh-token',
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.refreshTokens('invalid-id')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refreshTokens('invalid-id')).rejects.toThrow(
        'Недействительный токен обновления',
      );
    });

    it('should throw UnauthorizedException if user has no refresh token', async () => {
      mockUsersService.findById.mockResolvedValue({
        ...mockUser,
        refreshToken: null,
      });

      await expect(service.refreshTokens('user-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
