import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';

import { AuthService } from './auth.service';
import { RequestWithUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  async register(
    @Body() registerDto: RegisterDto,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    return await this.authService.register(registerDto, res);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в систему' })
  async login(
    @Request() req: RequestWithUser,
    @Response({ passthrough: true }) res: ExpressResponse,
    @Body() _loginDto: LoginDto,
  ) {
    return await this.authService.login(req.user, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Выход из системы (очистка токенов)' })
  async logout(
    @Request() req: RequestWithUser,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    return await this.authService.logout(req.user.id, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Получение профиля текущего пользователя' })
  async getProfile(@Request() req: RequestWithUser) {
    return await this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Смена пароля' })
  async updatePassword(
    @Request() req: RequestWithUser,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return await this.authService.updatePassword(
      req.user.id,
      updatePasswordDto,
    );
  }
}
