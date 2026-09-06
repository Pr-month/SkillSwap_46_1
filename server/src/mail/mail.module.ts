import { createMailerOptions } from '@/config/mail.config';
import { ConfigurationModule } from '@/module/configuration/configuration.module';
import { ConfigurationService } from '@/module/configuration/configuration.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';

import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (configurationService: ConfigurationService) => {
        return createMailerOptions(configurationService);
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
