import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';

import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BusinessException } from '../common/errors/business.exception';
import { exceptionCodes } from '../common/errors/error-codes';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201, type: RegisterResponseDto })
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException(
        exceptionCodes.common.internal,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('check-user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Проверка существования пользователя по email' })
  async checkUser(@Body() loginDto: LoginDto) {
    return this.authService.checkUser(loginDto.email);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async login(@Request() req, @Body() _: LoginDto) {
    return this.authService.login(req.user);
  }

   @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Получение профиля текущего пользователя' })
  async getProfile(@Request() req) {
    try {
      return await this.authService.getProfile(req.user.id);
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException(
        exceptionCodes.common.internal,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Смена пароля' })
  async updatePassword(
    @Request() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    try {
      return await this.authService.updatePassword(
        req.user.id,
        updatePasswordDto,
      );
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException(
        exceptionCodes.common.internal,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  } 
}
