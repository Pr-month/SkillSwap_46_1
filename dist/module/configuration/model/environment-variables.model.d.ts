import { EnvKey } from '../const';
export declare class EnvironmentVariables {
    [EnvKey.NodeEnv]: string;
    [EnvKey.Port]: number;
    [EnvKey.HashSalt]: string;
    [EnvKey.JwtAccessSecret]: string;
    [EnvKey.JwtRefreshSecret]: string;
    [EnvKey.JwtAccessExpiresIn]: string;
    [EnvKey.JwtRefreshExpiresIn]: string;
    [EnvKey.DatabaseHost]: string;
    [EnvKey.DatabasePort]: number;
    [EnvKey.DatabaseUsername]: string;
    [EnvKey.DatabasePassword]: string;
    [EnvKey.DatabaseName]: string;
    [EnvKey.DatabaseSynchronize]: boolean;
    [EnvKey.LoggerType]: string;
}
