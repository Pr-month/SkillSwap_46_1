import { ConfigurationService } from '../module/configuration/configuration.service';
import { dbConfig } from './db.config';

describe('dbConfig', () => {
  it('creates PostgreSQL options from ConfigurationService getters', () => {
    const configurationService = {
      databaseHost: 'database',
      databasePort: 5433,
      databaseUsername: 'skill_swap',
      databasePassword: 'secret',
      databaseName: 'skill_swap_test',
      databaseSynchronize: true,
    } as ConfigurationService;

    expect(dbConfig(configurationService)).toMatchObject({
      type: 'postgres',
      host: 'database',
      port: 5433,
      username: 'skill_swap',
      password: 'secret',
      database: 'skill_swap_test',
      synchronize: true,
    });
  });
});
