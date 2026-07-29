import { ConfigType, registerAs } from "@nestjs/config";

export const configuration = registerAs('APP_CONFIG', () => ({
  port: Number(process.env.PORT) || 3000,
  hashSalt: process.env.HASH_SALT || 'a3f1b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1',
}));


export type TConfig = ConfigType<typeof configuration>;