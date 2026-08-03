import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsDateString,
  IsEnum,
  IsUrl,
} from 'class-validator';

import { UserProfileResponse } from '../../users/dto/user-profile.response';
import { UserGender } from '../../users/enums/user.enums';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    minLength: 6,
    description: 'Пароль',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Иван Петров',
    description: 'Полное имя',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Дата рождения в формате YYYY-MM-DD',
  })
  @IsDateString()
  birthdate: string;

  @ApiPropertyOptional({
    enum: UserGender,
    default: UserGender.OTHER,
    description: 'Пол',
  })
  @IsEnum(UserGender)
  @IsOptional()
  gender?: UserGender = UserGender.OTHER;

  @ApiProperty({
    example: 'Москва',
    description: 'Город',
  })
  @IsString()
  city: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'URL аватара',
  })
  @IsUrl()
  avatar: string;

  @ApiPropertyOptional({
    example: 'О себе...',
    description: 'Краткая информация',
  })
  @IsString()
  @IsOptional()
  about?: string;
}

// Ответ на регистрацию
export class RegisterResponseDto {
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
