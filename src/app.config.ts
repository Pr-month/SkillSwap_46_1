
import { ConfigurationService } from './module/configuration/configuration.service';

export const appConfig = (
  configurationService: ConfigurationService,
) => ({
  port: configurationService.port,
  hashSalt: configurationService.hashSalt
});
