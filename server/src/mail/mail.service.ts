import { BusinessException } from '@/common/errors/business.exception';
import { exceptionCodes } from '@/common/errors/error-codes';
import { ConfigurationService } from '@/module/configuration/configuration.service';
import { REDIS_CLIENT } from '@/redis/redis.module';
import { UsersService } from '@/users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { Request } from 'express';
import { Redis } from 'ioredis';

import { MAIL_TEMPLATES } from './mail.constants';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigurationService,
    private readonly usersService: UsersService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async markTokenAsUsed(
    token: string,
    ttlSeconds: number,
  ): Promise<void> {
    const tokenHash = this.hashToken(token);
    await this.redis.set(`used_token:${tokenHash}`, '1', 'EX', ttlSeconds);
  }

  private async isTokenUsed(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);
    const result = await this.redis.get(`used_token:${tokenHash}`);
    return !!result;
  }

  private getBaseUrl(request?: Request): string {
    if (request) {
      const origin = request.get('origin');
      if (origin) {
        return origin;
      }

      const referer = request.get('referer');
      if (referer) {
        return new URL(referer).origin;
      }

      const protocol = request.protocol;
      const host = request.get('host');
      if (host) {
        return `${protocol}://${host}`;
      }
    }

    return 'http://localhost:4567';
  }

  private async clearThrottle(key: string, ip?: string): Promise<void> {
    if (!ip) return;

    await this.redis.del(`mail:${key}:${ip}`);
  }

  async sendUserNotification(
    email: string,
    payload: {
      subject: string;
      message?: string;
      html?: string;
    },
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: payload.subject,
      text: payload.message,
      html: payload.html,
    });
  }

  async sendConfirmationEmail(userId: string, request?: Request) {
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
      { sub: user.id, email: user.email, tokenType: 'confirmation' },
      {
        expiresIn: '24h',
        secret: this.configService.jwtAccessSecret,
      },
    );

    const baseUrl = this.getBaseUrl(request);
    const confirmationLink = `${baseUrl}/?token=${confirmationToken}`;

    await this.sendUserNotification(user.email, {
      subject: MAIL_TEMPLATES.confirmation.subject,
      html: MAIL_TEMPLATES.confirmation.getHtml(confirmationLink),
    });

    return { message: 'Письмо отправлено' };
  }

  async confirmEmail(token: string, request?: Request) {
    try {
      // Проверка, не использован ли токен
      if (await this.isTokenUsed(token)) {
        throw new BusinessException(
          exceptionCodes.users.invalidToken,
          HttpStatus.BAD_REQUEST,
        );
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.jwtAccessSecret,
      });

      if (payload.tokenType !== 'confirmation') {
        throw new BusinessException(
          exceptionCodes.users.invalidToken,
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.usersService.confirmEmail(payload.sub);

      // Помечаем токен как использованный
      await this.markTokenAsUsed(token, 24 * 60 * 60);

      // Удалить троттлинг после успешного подтверждения
      const ip = request?.ip || request?.socket?.remoteAddress;
      await this.clearThrottle('confirmation', ip);

      return { message: 'Email подтвержден' };
    } catch (error) {
      this.logger.warn('Не удалось подтвердить email', error);
      throw new BusinessException(
        exceptionCodes.users.invalidToken,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async sendResetPasswordEmail(email: string, request?: Request) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BusinessException(
        exceptionCodes.users.notFound,
        HttpStatus.NOT_FOUND,
      );
    }

    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, tokenType: 'reset-password' },
      {
        expiresIn: '1h',
        secret: this.configService.jwtAccessSecret,
      },
    );

    const baseUrl = this.getBaseUrl(request);
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    await this.sendUserNotification(user.email, {
      subject: MAIL_TEMPLATES.resetPassword.subject,
      html: MAIL_TEMPLATES.resetPassword.getHtml(resetLink),
    });
  }
}
