import { ConfigurationService } from '@/module/configuration/configuration.service';
import { MailerOptions } from '@nestjs-modules/mailer';

export const createMailerOptions = (
  configurationService: ConfigurationService,
): MailerOptions => {
  return {
    transport: {
      host: configurationService.mailHost,
      port: configurationService.mailPort,
      secure: false,
      requireTLS: true,
      auth: {
        user: configurationService.mailUser,
        pass: configurationService.mailPassword,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
      },
    },
    defaults: {
      from: configurationService.mailFrom,
    },
  };
};
