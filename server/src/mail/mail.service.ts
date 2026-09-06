import { BusinessException } from '@/common/errors/business.exception';
import { exceptionCodes } from '@/common/errors/error-codes';
import { ConfigurationService } from '@/module/configuration/configuration.service';
import { UsersService } from '@/users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { MAIL_TEMPLATES } from './mail.constants';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigurationService,
    private readonly usersService: UsersService,
  ) {}

  async sendUserNotification(
    email: string,
    payload: {
      subject: string;
      message: string;
    },
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: payload.subject,
      text: payload.message,
    });
  }

  async sendConfirmationEmail(userId: string) {
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

    const confirmationLink = `http://localhost:4567/mail/confirm-email?token=${confirmationToken}`; // todo переделать

    await this.sendUserNotification(user.email, {
      subject: MAIL_TEMPLATES.confirmation.subject,
      message: MAIL_TEMPLATES.confirmation.getText(confirmationLink),
    });

    return { message: 'Письмо отправлено' };
  }

  async confirmEmail(token: string) {
    try {
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

      return { message: 'Email подтвержден' };
    } catch (error) {
      this.logger.warn('Не удалось подтвердить email', error);
      throw new BusinessException(
        exceptionCodes.users.invalidToken,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async sendResetPasswordEmail(email: string): Promise<void> {
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

    const resetLink = `http://localhost:4567/api/auth/reset-password?token=${resetToken}`; // todo переделать

    await this.sendUserNotification(user.email, {
      subject: MAIL_TEMPLATES.resetPassword.subject,
      message: MAIL_TEMPLATES.resetPassword.getText(resetLink),
    });
  }
}
