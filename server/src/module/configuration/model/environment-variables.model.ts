/* eslint-disable prettier/prettier */
import {EnvKey, nodeEnvValues} from '../const';
import {IsArray, IsBoolean, IsIn, IsNotEmpty, IsNumber, IsString, Max, Min} from "class-validator";
import {Transform} from "class-transformer";
import {transformStringIPsToArr} from "../configuration.common";
import {IsCorsOriginValue} from "../validation/is-ip-or-localhost";

export class EnvironmentVariables {
  @IsString()
  @IsIn(nodeEnvValues)
  [EnvKey.NodeEnv]: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1)
  @Max(65535)
  [EnvKey.Port]: number;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(4)
  @Max(31)
  [EnvKey.HashSalt]: number;

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
  @IsNotEmpty()
  [EnvKey.S3Region]: string;

  @IsString()
  @IsNotEmpty()
  [EnvKey.S3AccessKeyId]: string;

  @IsString()
  @IsNotEmpty()
  [EnvKey.S3SecretAccessKey]: string;

  @IsString()
  @IsNotEmpty()
  [EnvKey.S3Endpoint]: string;

  @IsString()
  @IsNotEmpty()
  [EnvKey.S3Bucket]: string;

  @IsArray()
  @Transform(({ value }) => transformStringIPsToArr(value))
  @IsCorsOriginValue({ each: true })
  [EnvKey.CorsOrigins]: string[];

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1)
  [EnvKey.ThrottleTtl]: number;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1)
  [EnvKey.ThrottleLimit]: number;

  @IsString()
  @IsNotEmpty()
  [EnvKey.MailHost]: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1)
  @Max(65535)
  [EnvKey.MailPort]: number;

  @IsString()
  @IsNotEmpty()
  [EnvKey.MailUser]: string;

  @IsString()
  @IsNotEmpty()
  [EnvKey.MailPassword]: string;

  @IsString()
  @IsNotEmpty()
  [EnvKey.MailFrom]: string;

  @IsString()
  @IsNotEmpty()
  [EnvKey.RedisHost]: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1)
  @Max(65535)
  [EnvKey.RedisPort]: number;
}