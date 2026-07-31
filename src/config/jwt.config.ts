import { JwtConfig } from './jwt-config.type';
import { ConfigurationService } from '../module/configuration/configuration.service';

export const jwtConfigFactory = (config: ConfigurationService): JwtConfig => ({
  accessSecret: config.jwtAccessSecret,
  refreshSecret: config.jwtRefreshSecret,
  accessExpiresIn: config.jwtAccessExpiresIn,
  refreshExpiresIn: config.jwtRefreshExpiresIn,
});