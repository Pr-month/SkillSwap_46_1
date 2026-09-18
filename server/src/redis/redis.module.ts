import { ConfigurationModule } from '@/module/configuration/configuration.module';
import { ConfigurationService } from '@/module/configuration/configuration.service';
import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [ConfigurationModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigurationService],
      useFactory: (configurationService: ConfigurationService) => {
        return new Redis({
          host: configurationService.redisHost,
          port: configurationService.redisPort,
          lazyConnect: false,
        });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
