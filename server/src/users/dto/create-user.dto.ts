import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';

import { UserGender, UserRole } from '../enums/user.enums';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsDate()
  birthdate: Date;

  @IsString()
  city: string;

  @IsEnum(UserGender)
  gender: UserGender;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsEnum(UserRole)
  role: UserRole;
}
