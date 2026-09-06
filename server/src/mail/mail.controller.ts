import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ThrottleKey } from '@/mail/decorators/throttle-key.decorator';
import { MailThrottleGuard } from '@/mail/guards/confirmation-throttle.guard';
import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';

import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @UseGuards(JwtAuthGuard, MailThrottleGuard)
  @ThrottleKey('confirmation')
  @Post('send-confirmation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отправить письмо подтверждения email' })
  async sendConfirmationEmail(
    @Request() req: { user: { id: string } } & ExpressRequest,
  ) {
    return await this.mailService.sendConfirmationEmail(req.user.id, req);
  }

  @Get('confirm-email')
  async confirmEmail(
    @Query('token') token: string,
    @Request() req: ExpressRequest,
  ) {
    return await this.mailService.confirmEmail(token, req);
  }

  @UseGuards(MailThrottleGuard)
  @ThrottleKey('reset-password')
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отправить письмо для сброса пароля' })
  async forgotPassword(
    @Body() body: { email: string },
    @Request() req: ExpressRequest,
  ) {
    return await this.mailService.sendResetPasswordEmail(body.email, req);
  }
}
