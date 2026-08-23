import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './model';
export declare class ConfigurationService {
    private configService;
    constructor(configService: ConfigService<EnvironmentVariables, true>);
    get nodeEnv(): string;
    get port(): number;
    get hashSalt(): string;
    get jwtAccessSecret(): string;
    get jwtRefreshSecret(): string;
    get jwtAccessExpiresIn(): string;
    get jwtRefreshExpiresIn(): string;
    get databaseHost(): string;
    get databasePort(): number;
    get databaseUsername(): string;
    get databasePassword(): string;
    get databaseName(): string;
    get databaseSynchronize(): boolean;
    get loggerType(): string;
}
