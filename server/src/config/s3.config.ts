import { ConfigurationService } from '@/module/configuration/configuration.service';
import { S3Client } from '@aws-sdk/client-s3';

export const createS3Client = (
  configurationService: ConfigurationService,
): S3Client => {
  return new S3Client({
    region: configurationService.s3Region,
    credentials: {
      accessKeyId: configurationService.s3AccessKeyId,
      secretAccessKey: configurationService.s3SecretAccessKey,
    },
    endpoint: configurationService.s3Endpoint,
    forcePathStyle: true,
  });
};
