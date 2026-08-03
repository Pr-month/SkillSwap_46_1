import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { BusinessException } from '../common/errors/business.exception';
import { exceptionCodes } from '../common/errors/error-codes';
import { UserGender } from '../users/enums/user.enums';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    checkUser: jest.fn(),
    login: jest.fn(),
  };

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
      .compile();

    controller = module.get<AuthController>(AuthController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

    const registerResponse = {
      status: true,
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user: { id: 'user-id', email: 'test@example.com' },
    };

    it('should successfully register a user', async () => {
      mockAuthService.register.mockResolvedValue(registerResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(registerResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
    });

    it('should rethrow BusinessException if user already exists', async () => {
      const error = new BusinessException(
        exceptionCodes.users.alreadyExists,
        HttpStatus.CONFLICT,
      );
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(registerDto)).rejects.toThrow(
        BusinessException,
      );
      await expect(controller.register(registerDto)).rejects.toThrow(error);
    });

    it('should wrap unknown error in BusinessException', async () => {
      mockAuthService.register.mockRejectedValue(new Error('DB error'));

      await expect(controller.register(registerDto)).rejects.toThrow(
        BusinessException,
      );
    });
  });

  describe('checkUser', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };

    it('should return exists: true if user exists', async () => {
      mockAuthService.checkUser.mockResolvedValue({
        exists: true,
        email: 'test@example.com',
      });

      const result = await controller.checkUser(loginDto);

      expect(result).toEqual({ exists: true, email: 'test@example.com' });
      expect(mockAuthService.checkUser).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('should return exists: false if user does not exist', async () => {
      mockAuthService.checkUser.mockResolvedValue({
        exists: false,
        email: 'unknown@example.com',
      });

      const result = await controller.checkUser({
        ...loginDto,
        email: 'unknown@example.com',
      });

      expect(result.exists).toBe(false);
    });
  });

  describe('login', () => {
    const mockUser = { id: 'user-id', email: 'test@example.com', name: 'Иван' };
    const loginResponse = {
      status: true,
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user: mockUser,
    };

    it('should successfully login user', async () => {
      mockAuthService.login.mockResolvedValue(loginResponse);

      const mockRequest = { user: mockUser };
      const result = await controller.login(
        mockRequest as unknown as Request,
        {} as LoginDto,
      );

      expect(result).toEqual(loginResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    });
  });
});
