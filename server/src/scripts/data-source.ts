import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';

import { dbConfig } from '../config/db.config';
import { ConfigurationModule } from '../module/configuration/configuration.module';
import { ConfigurationService } from '../module/configuration/configuration.service';
import { validate } from '../module/configuration/validation/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ validate, isGlobal: true }),
    ConfigurationModule,
  ],
})
class ConfigBootstrapModule {}

async function createDataSource(): Promise<DataSource> {
  const context = await NestFactory.createApplicationContext(
    ConfigBootstrapModule,
    { logger: false },
  );

  const configurationService = context.get(ConfigurationService);
  const options = dbConfig(configurationService);

  console.log('DEBUG DB CONNECTION OPTIONS:', options);

  await context.close();

  return new DataSource(options);
}

export const getAppDataSource = createDataSource;