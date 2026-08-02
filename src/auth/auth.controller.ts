import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { BusinessException } from '../common/errors/business.exception';
import { exceptionCodes } from '../common/errors/error-codes';

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
    // @Body() _: LoginDto нужно только для Swagger-документации
    return this.authService.login(req.user);
  }



  
}
