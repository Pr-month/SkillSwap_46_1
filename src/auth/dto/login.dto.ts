import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

import { UserProfileResponse } from '../../users/dto/create-user.dto';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Пароль (минимум 6 символов)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}

// Ответ на логин (соответствует TLoginUserResponse)
export class LoginResponseDto {
  @ApiProperty({
    example: true,
    description: 'Статус ответа',
  })
  status: boolean;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT токен доступа',
  })
  access_token: string;

  @ApiProperty({
    description: 'Профиль пользователя',
    type: UserProfileResponse,
  })
  user: UserProfileResponse;
}
