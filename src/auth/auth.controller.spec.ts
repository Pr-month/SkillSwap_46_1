import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response as ExpressResponse } from 'express';

import { BusinessException } from '../common/errors/business.exception';
import { exceptionCodes } from '../common/errors/error-codes';
import { UserGender } from '../users/enums/user.enums';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RequestWithUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let _authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
    updatePassword: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as ExpressResponse;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    _authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Иван Петров',
      birthdate: '1990-01-01',
      gender: UserGender.MALE,
      city: 'Москва',
      avatar: 'https://example.com/avatar.jpg',
    };

    it('should successfully call authService.register with dto and response', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await controller.register(registerDto, mockResponse);

      expect(result).toEqual(mockUser);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        registerDto,
        mockResponse,
      );
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
    });

    it('should rethrow BusinessException if user already exists', async () => {
      const error = new BusinessException(
        exceptionCodes.users.alreadyExists,
        HttpStatus.CONFLICT,
      );
      mockAuthService.register.mockRejectedValue(error);

      await expect(
        controller.register(registerDto, mockResponse),
      ).rejects.toThrow(BusinessException);
    });
  });

  describe('login', () => {
    const mockUser = { id: 'user-id', email: 'test@example.com', name: 'Иван' };
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully call authService.login with user and response', async () => {
      mockAuthService.login.mockResolvedValue(mockUser);

      const mockRequest = { user: mockUser } as unknown as RequestWithUser;

      const result = await controller.login(
        mockRequest,
        mockResponse,
        loginDto,
      );

      expect(result).toEqual(mockUser);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockUser,
        mockResponse,
      );
    });
  });

  describe('logout', () => {
    it('should successfully call authService.logout with userId and response', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      const mockRequest = { user: mockUser } as unknown as RequestWithUser;

      mockAuthService.logout.mockResolvedValue({ message: 'Успешный выход' });

      const result = await controller.logout(mockRequest, mockResponse);

      expect(result).toEqual({ message: 'Успешный выход' });
      expect(mockAuthService.logout).toHaveBeenCalledWith(
        'user-id',
        mockResponse,
      );
    });
  });

  describe('getProfile', () => {
    it('should successfully call authService.getProfile with userId', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      const mockRequest = { user: mockUser } as RequestWithUser;

      mockAuthService.getProfile.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
      expect(mockAuthService.getProfile).toHaveBeenCalledWith('user-id');
    });
  });

  describe('updatePassword', () => {
    it('should successfully call authService.updatePassword with userId and dto', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      const mockRequest = { user: mockUser } as RequestWithUser;
      const updatePasswordDto: UpdatePasswordDto = {
        currentPassword: 'old',
        newPassword: 'new',
      };

      mockAuthService.updatePassword.mockResolvedValue({
        message: 'Пароль успешно обновлен',
      });

      const result = await controller.updatePassword(
        mockRequest,
        updatePasswordDto,
      );

      expect(result).toEqual({ message: 'Пароль успешно обновлен' });
      expect(mockAuthService.updatePassword).toHaveBeenCalledWith(
        'user-id',
        updatePasswordDto,
      );
    });
  });
});
