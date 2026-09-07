import { ForgotPasswordDto } from '@/auth/dto/forgot-password.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { getBaseUrl } from '@/common/utils/get-base-url';
import { ThrottleKey } from '@/mail/decorators/throttle-key.decorator';
import { MailThrottleGuard } from '@/mail/guards/confirmation-throttle.guard';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UseGuards,
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
    const baseUrl = getBaseUrl(req);
    return await this.mailService.sendConfirmationEmail(req.user.id, baseUrl);
  }

  @Get('confirm-email')
  @ApiOperation({ summary: 'Подтверждение email по токену' })
  async confirmEmail(@Query('token') token: string) {
    return await this.mailService.confirmEmail(token);
  }

  @UseGuards(MailThrottleGuard)
  @ThrottleKey('reset-password')
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отправить письмо для сброса пароля' })
  async forgotPassword(
    @Body() body: ForgotPasswordDto,
    @Request() req: ExpressRequest,
  ) {
    const baseUrl = getBaseUrl(req);
    return await this.mailService.sendResetPasswordEmail(body.email, baseUrl);
  }
}
