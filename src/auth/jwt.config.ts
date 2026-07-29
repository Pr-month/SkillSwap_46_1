import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  /** Секретный ключ для подписи access-токена */
  accessSecret: string;

  /** Секретный ключ для подписи refresh-токена */
  refreshSecret: string;

  /** Время жизни access-токена (например, '15m') */
  accessExpiresIn: string;

  /** Время жизни refresh-токена (например, '7d') */
  refreshExpiresIn: string;
}

export const jwtConfig = registerAs(
  'jwt',
  (): JwtConfig => ({
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  }),
);