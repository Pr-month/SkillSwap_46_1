/* eslint-disable prettier/prettier */
import { EnvKey } from '../const';
import {IsBoolean, IsIn, IsNotEmpty, IsNumber, IsString, Max, Min} from "class-validator";
import {Transform} from "class-transformer";

export class EnvironmentVariables {
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1)
  @Max(65535)
  [EnvKey.Port]: number;

  @IsString()
  @IsNotEmpty()
  [EnvKey.HashSalt]: string;

  @IsString()
  @IsNotEmpty()
  [EnvKey.JwtAccessSecret]: string;

  @IsString()
  @IsNotEmpty()
  [EnvKey.JwtRefreshSecret]: string;

  @IsString()
  @IsNotEmpty()
  [EnvKey.JwtAccessExpiresIn]: string;

  @IsString()
  @IsNotEmpty()
  [EnvKey.JwtRefreshExpiresIn]: string;

  @IsString()
  @IsNotEmpty()
  [EnvKey.DatabaseHost]: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1)
  @Max(65535)
  [EnvKey.DatabasePort]: number;

  @IsString()
  @IsNotEmpty()
  [EnvKey.DatabaseUsername]: string;

  @IsString()
  @IsNotEmpty()
  [EnvKey.DatabasePassword]: string;

  @IsString()
  @IsNotEmpty()
  [EnvKey.DatabaseName]: string;

  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  [EnvKey.DatabaseSynchronize]: boolean;

  @IsString()
  @IsIn(['dev', 'production', 'test', 'combined', 'console'])
  [EnvKey.LoggerType]: string;
}