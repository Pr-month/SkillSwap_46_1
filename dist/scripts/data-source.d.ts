import { DataSource } from 'typeorm';
declare function createDataSource(): Promise<DataSource>;
export declare const getAppDataSource: typeof createDataSource;
export {};
