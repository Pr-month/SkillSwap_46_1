"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfigFactory = void 0;
const jwtConfigFactory = (config) => ({
    accessSecret: config.jwtAccessSecret,
    refreshSecret: config.jwtRefreshSecret,
    accessExpiresIn: config.jwtAccessExpiresIn,
    refreshExpiresIn: config.jwtRefreshExpiresIn,
});
exports.jwtConfigFactory = jwtConfigFactory;
//# sourceMappingURL=jwt.config.js.map