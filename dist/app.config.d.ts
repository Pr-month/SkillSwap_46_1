import { ConfigurationService } from './module/configuration/configuration.service';
export declare const appConfig: (configurationService: ConfigurationService) => {
    port: number;
    hashSalt: string;
};
