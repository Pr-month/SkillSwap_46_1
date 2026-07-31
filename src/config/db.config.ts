import { registerAs, ConfigType } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import * as path from 'path';

export const dbConfig = registerAs('db', (): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'skillswap',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  entities: [path.join(__dirname, '/../**/*.entity{.ts,.js}')],
}));

export type IDbConfig = ConfigType<typeof dbConfig>;
