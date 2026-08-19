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

  get loggerType(): string {
    return this.configService.get<string>(EnvKey.LoggerType);
  }
}