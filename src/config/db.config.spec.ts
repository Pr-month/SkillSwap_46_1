import { EnvKey } from '../module/configuration/const';
import { dbConfig } from './db.config';

describe('dbConfig', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('creates PostgreSQL options from environment variables', () => {
    process.env = {
      ...originalEnv,
      [EnvKey.DatabaseHost]: 'database',
      [EnvKey.DatabasePort]: '5433',
      [EnvKey.DatabaseUsername]: 'skill_swap',
      [EnvKey.DatabasePassword]: 'secret',
      [EnvKey.DatabaseName]: 'skill_swap_test',
      [EnvKey.DatabaseSynchronize]: 'true',
    };

    expect(dbConfig()).toMatchObject({
      type: 'postgres',
      host: 'database',
      port: 5433,
      username: 'skill_swap',
      password: 'secret',
      database: 'skill_swap_test',
      synchronize: true,
    });
  });

  it('uses safe local defaults when database variables are absent', () => {
    process.env = { ...originalEnv };
    for (const key of [
      EnvKey.DatabaseHost,
      EnvKey.DatabasePort,
      EnvKey.DatabaseUsername,
      EnvKey.DatabasePassword,
      EnvKey.DatabaseName,
      EnvKey.DatabaseSynchronize,
    ]) {
      delete process.env[key];
    }

    expect(dbConfig()).toMatchObject({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'skillswap',
      synchronize: false,
    });
  });
});
