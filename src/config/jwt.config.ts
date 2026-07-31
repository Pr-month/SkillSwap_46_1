import { registerAs, ConfigType } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET ?? 'access-secret-dev',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret-dev',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
}));

export type IJwtConfig = ConfigType<typeof jwtConfig>;
