import { TokenType } from '@/common/enums/token-type.enum';
import { BusinessException } from '@/common/errors/business.exception';
import { TokenBlacklistService } from '@/common/services/token-blacklist.service';
import { getMailThrottleRedisKey } from '@/mail/constants/mail-throttle.constants';
import { ConfigurationService } from '@/module/configuration/configuration.service';
import { REDIS_CLIENT } from '@/redis/redis.module';
import { UsersService } from '@/users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { MAIL_TEMPLATES } from './constants/mail.constants';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;

  const mockUser = {
    id: 'user-uuid-123',
    email: 'test@example.com',
    name: 'Иван Петров',
    isEmailConfirmed: false,
    password: 'hashed-password',
  };

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    jwtAccessSecret: 'test-secret',
  };

  const mockUsersService = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    confirmEmail: jest.fn(),
  };

  const mockRedis = {
    del: jest.fn(),
  };

  const mockTokenBlacklistService = {
    isUsed: jest.fn(),
    markAsUsed: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigurationService,
          useValue: mockConfigService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: REDIS_CLIENT,
          useValue: mockRedis,
        },
        {
          provide: TokenBlacklistService,
          useValue: mockTokenBlacklistService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendUserNotification', () => {
    it('should throw if neither message nor html provided', async () => {
      await expect(
        service.sendUserNotification('test@example.com', {
          subject: 'Test',
        }),
      ).rejects.toThrow(BusinessException);
    });

    it('should send email with message', async () => {
      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendUserNotification('test@example.com', {
        subject: 'Test',
        message: 'Hello',
      });

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Test',
        text: 'Hello',
        html: undefined,
      });
    });

    it('should send email with html', async () => {
      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendUserNotification('test@example.com', {
        subject: 'Test',
        html: '<p>Hello</p>',
      });

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Test',
        text: undefined,
        html: '<p>Hello</p>',
      });
    });
  });

  describe('sendConfirmationEmail', () => {
    const userId = 'user-uuid-123';
    const baseUrl = 'http://localhost:5173';

    beforeEach(() => {
      mockJwtService.signAsync.mockResolvedValue('confirmation-token');
      mockMailerService.sendMail.mockResolvedValue(undefined);
    });

    it('should send confirmation email', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await service.sendConfirmationEmail(userId, baseUrl);

      expect(result).toEqual({ message: 'Письмо отправлено' });

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: userId,
          email: mockUser.email,
          tokenType: TokenType.CONFIRMATION,
        },
        {
          expiresIn: '24h',
          secret: 'test-secret',
        },
      );

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: mockUser.email,
        subject: MAIL_TEMPLATES.confirmation.subject,
        html: expect.stringContaining('confirmation-token'),
      });
    });

    it('should throw if user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(
        service.sendConfirmationEmail(userId, baseUrl),
      ).rejects.toThrow(BusinessException);
    });

    it('should throw if email already confirmed', async () => {
      mockUsersService.findById.mockResolvedValue({
        ...mockUser,
        isEmailConfirmed: true,
      });

      await expect(
        service.sendConfirmationEmail(userId, baseUrl),
      ).rejects.toThrow(BusinessException);
    });
  });

  describe('confirmEmail', () => {
    const token = 'valid-token';

    beforeEach(() => {
      mockTokenBlacklistService.isUsed.mockResolvedValue(false);
      mockUsersService.confirmEmail.mockResolvedValue(undefined);
      mockTokenBlacklistService.markAsUsed.mockResolvedValue(undefined);
      mockRedis.del.mockResolvedValue(undefined);
    });

    it('should confirm email', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: mockUser.id,
        email: mockUser.email,
        tokenType: TokenType.CONFIRMATION,
      });

      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await service.confirmEmail(token);

      expect(result).toEqual({ message: 'Email подтвержден' });

      expect(mockUsersService.confirmEmail).toHaveBeenCalledWith(mockUser.id);

      expect(mockTokenBlacklistService.markAsUsed).toHaveBeenCalledWith(
        token,
        24 * 60 * 60,
      );

      expect(mockRedis.del).toHaveBeenCalledWith(
        getMailThrottleRedisKey('confirmation', mockUser.email),
      );
    });

    it('should throw if token already used', async () => {
      mockTokenBlacklistService.isUsed.mockResolvedValue(true);

      await expect(service.confirmEmail(token)).rejects.toThrow(
        BusinessException,
      );
    });

    it('should throw if token type is not confirmation', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: mockUser.id,
        email: mockUser.email,
        tokenType: TokenType.RESET_PASSWORD,
      });

      await expect(service.confirmEmail(token)).rejects.toThrow(
        BusinessException,
      );
    });

    it('should throw if user not found', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: mockUser.id,
        email: mockUser.email,
        tokenType: TokenType.CONFIRMATION,
      });

      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.confirmEmail(token)).rejects.toThrow(
        BusinessException,
      );
    });
  });

  describe('sendResetPasswordEmail', () => {
    const email = 'test@example.com';
    const baseUrl = 'http://localhost:5173';

    beforeEach(() => {
      mockJwtService.signAsync.mockResolvedValue('reset-token');
      mockMailerService.sendMail.mockResolvedValue(undefined);
    });

    it('should send reset password email', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await service.sendResetPasswordEmail(email, baseUrl);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          email: mockUser.email,
          tokenType: TokenType.RESET_PASSWORD,
        },
        {
          expiresIn: '1h',
          secret: 'test-secret',
        },
      );

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: mockUser.email,
        subject: MAIL_TEMPLATES.resetPassword.subject,
        html: expect.stringContaining('reset-token'),
      });
    });

    it('should throw if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.sendResetPasswordEmail(email, baseUrl),
      ).rejects.toThrow(BusinessException);
    });
  });
});
