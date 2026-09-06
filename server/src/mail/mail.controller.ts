import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ConfirmationThrottleGuard } from '@/mail/guards/confirmation-throttle.guard';
import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @UseGuards(JwtAuthGuard, ConfirmationThrottleGuard)
  @Post('send-confirmation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отправить письмо подтверждения email' })
  async sendConfirmationEmail(@Request() req: { user: { id: string } }) {
    return await this.mailService.sendConfirmationEmail(req.user.id);
  }

  @Get('confirm-email')
  @ApiOperation({ summary: 'Подтверждение email по токену' })
  async confirmEmail(@Query('token') token: string) {
    return await this.mailService.confirmEmail(token);
  }
}
