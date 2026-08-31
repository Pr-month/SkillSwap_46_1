import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsDateString,
  IsEnum,
  IsUrl,
  IsArray,
  IsUUID,
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
  gender: UserGender = UserGender.OTHER;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID города из справочника',
  })
  @IsUUID()
  cityId: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'URL аватара',
  })
  @IsUrl({
    require_protocol: true,
    require_valid_protocol: true,
    protocols: ['http', 'https'],
    require_host: true,
    host_whitelist: ['localhost', '127.0.0.1'],
  })
  avatar: string;

  @ApiPropertyOptional({
    example: 'О себе...',
    description: 'Краткая информация',
  })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiPropertyOptional({
    description: 'ID категорий/навыков, которые пользователь хочет выучить',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  wantToLearn?: string[];

  @ApiPropertyOptional({
    description: 'ID навыков, которыми пользователь может научить',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440001'],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  skills?: string[];
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
