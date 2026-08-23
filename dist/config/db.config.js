"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfig = void 0;
const path_1 = require("path");
const dbConfig = (configurationService) => ({
    type: 'postgres',
    host: configurationService.databaseHost,
    port: configurationService.databasePort,
    username: configurationService.databaseUsername,
    password: configurationService.databasePassword,
    database: configurationService.databaseName,
    synchronize: configurationService.databaseSynchronize,
    entities: [(0, path_1.join)(__dirname, '..', '**', '*.entity{.ts,.js}')],
});
exports.dbConfig = dbConfig;
//# sourceMappingURL=db.config.js.map