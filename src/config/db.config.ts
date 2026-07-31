import { registerAs, ConfigType } from '@nestjs/config';
import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

import { EnvKey } from '../module/configuration/const';

export const dbConfig = registerAs('db', (): DataSourceOptions => {
  return {
    type: 'postgres',
    host: process.env[EnvKey.DatabaseHost] ?? 'localhost',
    port: Number(process.env[EnvKey.DatabasePort]) || 5432,
    username: process.env[EnvKey.DatabaseUsername] ?? 'postgres',
    password: process.env[EnvKey.DatabasePassword] ?? 'postgres',
    database: process.env[EnvKey.DatabaseName] ?? 'skillswap',
    synchronize: process.env[EnvKey.DatabaseSynchronize] === 'true',
    entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  };
});

export type DbConfig = ConfigType<typeof dbConfig>;
