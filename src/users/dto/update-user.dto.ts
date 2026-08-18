import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { UserGender } from '../enums/user.enums';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  about?: string | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthdate?: Date;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID города из справочника',
  })
  @IsUUID()
  @IsOptional()
  cityId?: string;

  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;

  @IsOptional()
  @IsUrl()
  @MaxLength(1000)
  avatar?: string | null;
}
