import { createS3Client } from '@/config/s3.config';
import { ConfigurationService } from '@/module/configuration/configuration.service';
import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';

import { S3Controller } from './s3.controller';
import { S3Service } from './s3.service';

@Module({
  controllers: [S3Controller],
  providers: [
    {
      provide: S3Client,
      useFactory: (configurationService: ConfigurationService) =>
        createS3Client(configurationService),
      inject: [ConfigurationService],
    },
    S3Service,
  ],
  exports: [S3Service],
})
export class S3Module {}
