import { registerAs, ConfigType } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
}));

export type IJwtConfig = ConfigType<typeof jwtConfig>;
