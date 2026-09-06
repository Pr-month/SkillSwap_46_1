import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

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
}
