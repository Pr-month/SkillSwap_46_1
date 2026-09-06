import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EnvKey } from './const';
import { EnvironmentVariables } from './model';

@Injectable()
export class ConfigurationService {
  constructor(
    private configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  get nodeEnv(): string {
    return this.configService.get<string>(EnvKey.NodeEnv);
  }

  get port(): number {
    return this.configService.get<number>(EnvKey.Port);
  }

  get hashSalt(): number {
    return Number(this.configService.get<string>(EnvKey.HashSalt));
  }

  get jwtAccessSecret(): string {
    return this.configService.get<string>(EnvKey.JwtAccessSecret);
  }

  get jwtRefreshSecret(): string {
    return this.configService.get<string>(EnvKey.JwtRefreshSecret);
  }

  get jwtAccessExpiresIn(): string {
    return this.configService.get<string>(EnvKey.JwtAccessExpiresIn);
  }

  get jwtRefreshExpiresIn(): string {
    return this.configService.get<string>(EnvKey.JwtRefreshExpiresIn);
  }

  get databaseHost(): string {
    return this.configService.get<string>(EnvKey.DatabaseHost);
  }

  get databasePort(): number {
    return this.configService.get<number>(EnvKey.DatabasePort);
  }

  get databaseUsername(): string {
    return this.configService.get<string>(EnvKey.DatabaseUsername);
  }

  get databasePassword(): string {
    return this.configService.get<string>(EnvKey.DatabasePassword);
  }

  get databaseName(): string {
    return this.configService.get<string>(EnvKey.DatabaseName);
  }

  get databaseSynchronize(): boolean {
    return this.configService.get<boolean>(EnvKey.DatabaseSynchronize);
  }

  get s3Region(): string {
    return this.configService.get<string>(EnvKey.S3Region);
  }

  get s3AccessKeyId(): string {
    return this.configService.get<string>(EnvKey.S3AccessKeyId);
  }

  get s3SecretAccessKey(): string {
    return this.configService.get<string>(EnvKey.S3SecretAccessKey);
  }

  get s3Endpoint(): string {
    return this.configService.get<string>(EnvKey.S3Endpoint);
  }

  get s3Bucket(): string {
    return this.configService.get<string>(EnvKey.S3Bucket);
  }

  get corsOrigins(): string[] {
    return this.configService.get<string[]>(EnvKey.CorsOrigins);
  }

  get throttleTtl(): number {
    return this.configService.get<number>(EnvKey.ThrottleTtl);
  }

  get throttleLimit(): number {
    return this.configService.get<number>(EnvKey.ThrottleLimit);
  }

  get mailHost(): string {
    return this.configService.get<string>(EnvKey.MailHost);
  }

  get mailPort(): number {
    return this.configService.get<number>(EnvKey.MailPort);
  }

  get mailUser(): string {
    return this.configService.get<string>(EnvKey.MailUser);
  }

  get mailPassword(): string {
    return this.configService.get<string>(EnvKey.MailPassword);
  }

  get mailFrom(): string {
    return this.configService.get<string>(EnvKey.MailFrom);
  }

  get redisHost(): string {
    return this.configService.get<string>(EnvKey.RedisHost);
  }

  get redisPort(): number {
    return this.configService.get<number>(EnvKey.RedisPort);
  }
}
