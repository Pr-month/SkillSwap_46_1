import { TokenType } from '@/common/enums/token-type.enum';
import { BusinessException } from '@/common/errors/business.exception';
import { exceptionCodes } from '@/common/errors/error-codes';
import { TokenBlacklistService } from '@/common/services/token-blacklist.service';
import { getMailThrottleRedisKey } from '@/mail/constants/mail-throttle.constants';
import { ConfigurationService } from '@/module/configuration/configuration.service';
import { REDIS_CLIENT } from '@/redis/redis.module';
import { UsersService } from '@/users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Redis } from 'ioredis';

import { MAIL_TEMPLATES } from './constants/mail.constants';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigurationService,
    private readonly usersService: UsersService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  async sendUserNotification(
    email: string,
    payload: {
      subject: string;
      message?: string;
      html?: string;
    },
  ): Promise<void> {
    if (!payload.message && !payload.html) {
      throw new BusinessException(
        exceptionCodes.mail.invalidPayload,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: payload.subject,
        text: payload.message,
        html: payload.html,
      });

      this.logger.log(
        `Email sent | to: ${email} | subject: ${payload.subject}`,
      );
    } catch (error) {
      this.logger.error(
        `Email sending failed | to: ${email} | subject: ${payload.subject}`,
        error,
      );
      throw error;
    }
  }

  async sendConfirmationEmail(userId: string, baseUrl: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new BusinessException(
        exceptionCodes.users.notFound,
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.isEmailConfirmed) {
      throw new BusinessException(
        exceptionCodes.users.emailAlreadyConfirmed,
        HttpStatus.CONFLICT,
      );
    }

    const confirmationToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, tokenType: TokenType.CONFIRMATION },
      {
        expiresIn: '24h',
        secret: this.configService.jwtAccessSecret,
      },
    );

    const confirmationLink = `${baseUrl}/?token=${confirmationToken}`;

    await this.sendUserNotification(user.email, {
      subject: MAIL_TEMPLATES.confirmation.subject,
      html: MAIL_TEMPLATES.confirmation.getHtml(confirmationLink),
    });

    return { message: 'Письмо отправлено' };
  }

  async confirmEmail(token: string) {
    try {
      if (await this.tokenBlacklistService.isUsed(token)) {
        throw new BusinessException(
          exceptionCodes.users.invalidToken,
          HttpStatus.BAD_REQUEST,
        );
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.jwtAccessSecret,
      });

      if (payload.tokenType !== TokenType.CONFIRMATION) {
        throw new BusinessException(
          exceptionCodes.users.invalidToken,
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new BusinessException(
          exceptionCodes.users.notFound,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.usersService.confirmEmail(payload.sub);

      await this.tokenBlacklistService.markAsUsed(token, 24 * 60 * 60);

      await this.redis.del(getMailThrottleRedisKey('confirmation', user.email));

      return { message: 'Email подтвержден' };
    } catch (error) {
      this.logger.warn('Email confirmation failed', error);
      throw new BusinessException(
        exceptionCodes.users.invalidToken,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async sendResetPasswordEmail(email: string, baseUrl: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return;
    }

    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, tokenType: TokenType.RESET_PASSWORD },
      {
        expiresIn: '24h',
        secret: this.configService.jwtAccessSecret,
      },
    );

    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    await this.sendUserNotification(user.email, {
      subject: MAIL_TEMPLATES.resetPassword.subject,
      html: MAIL_TEMPLATES.resetPassword.getHtml(resetLink),
    });
  }
}
