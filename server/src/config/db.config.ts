import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

import { ConfigurationService } from '../module/configuration/configuration.service';

export const dbConfig = (
  configurationService: ConfigurationService,
): DataSourceOptions => {
  const options: DataSourceOptions = {
    type: 'postgres',
    host: configurationService.databaseHost,
    port: configurationService.databasePort,
    username: configurationService.databaseUsername,
    password: configurationService.databasePassword,
    database: configurationService.databaseName,
    synchronize: configurationService.databaseSynchronize,
    entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  };

  console.log('DEBUG LIVE SERVER DB CONFIG:', options);

  return options;
};