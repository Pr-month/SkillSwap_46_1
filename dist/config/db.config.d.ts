import { DataSourceOptions } from 'typeorm';
import { ConfigurationService } from '../module/configuration/configuration.service';
export declare const dbConfig: (configurationService: ConfigurationService) => DataSourceOptions;
