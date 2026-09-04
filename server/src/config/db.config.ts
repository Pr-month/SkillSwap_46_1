import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

import { ConfigurationService } from '../module/configuration/configuration.service';

export const dbConfig = (
  configurationService: ConfigurationService,
): DataSourceOptions => {
  // Под ts-jest (e2e/unit) файлы сущностей загружаются из `src` как `.ts`.
  // Абсолютный glob-путь с буквой диска (из `__dirname`) под Windows ломает
  // `require` внутри jest-resolve (возникает двойной префикс `c:\C:\`),
  // поэтому для исходников используем относительный glob от `process.cwd()`.
  // В собранном приложении (`dist`, `.js`) остаётся стандартный glob от `__dirname`.
  const isTsRuntime = __filename.endsWith('.ts');
  const entities = isTsRuntime
    ? 'src/**/*.entity{.ts,.js}'
    : join(__dirname, '..', '**', '*.entity{.ts,.js}');

  const options: DataSourceOptions = {
    type: 'postgres',
    host: configurationService.databaseHost,
    port: configurationService.databasePort,
    username: configurationService.databaseUsername,
    password: configurationService.databasePassword,
    database: configurationService.databaseName,
    synchronize: configurationService.databaseSynchronize,
    entities: [entities],
  };

  console.log('DEBUG LIVE SERVER DB CONFIG:', options);

  return options;
};
