import { createMailerOptions } from '@/config/mail.config';
import { MailThrottleGuard } from '@/mail/guards/confirmation-throttle.guard';
import { ConfigurationModule } from '@/module/configuration/configuration.module';
import { ConfigurationService } from '@/module/configuration/configuration.service';
import { UsersModule } from '@/users/users.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { MailController } from './mail.controller';
import { MailService } from './mail.service';

@Module({
  imports: [
    JwtModule.register({}),
    UsersModule,
    MailerModule.forRootAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (configurationService: ConfigurationService) => {
        return createMailerOptions(configurationService);
      },
    }),
  ],
  controllers: [MailController],
  providers: [MailService, MailThrottleGuard],
  exports: [MailService],
})
export class MailModule {}
