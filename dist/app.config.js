"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
const appConfig = (configurationService) => ({
    port: configurationService.port,
    hashSalt: configurationService.hashSalt,
});
exports.appConfig = appConfig;
//# sourceMappingURL=app.config.js.map