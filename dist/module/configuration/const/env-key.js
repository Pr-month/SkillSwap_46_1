"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvKey = void 0;
var EnvKey;
(function (EnvKey) {
    EnvKey["NodeEnv"] = "NODE_ENV";
    EnvKey["Port"] = "APP_PORT";
    EnvKey["HashSalt"] = "HASH_SALT";
    EnvKey["JwtAccessSecret"] = "JWT_ACCESS_SECRET";
    EnvKey["JwtRefreshSecret"] = "JWT_REFRESH_SECRET";
    EnvKey["JwtAccessExpiresIn"] = "JWT_ACCESS_EXPIRES_IN";
    EnvKey["JwtRefreshExpiresIn"] = "JWT_REFRESH_EXPIRES_IN";
    EnvKey["DatabaseHost"] = "DB_HOST";
    EnvKey["DatabasePort"] = "DB_PORT";
    EnvKey["DatabaseUsername"] = "DB_USERNAME";
    EnvKey["DatabasePassword"] = "DB_PASSWORD";
    EnvKey["DatabaseName"] = "DB_NAME";
    EnvKey["DatabaseSynchronize"] = "DB_SYNCHRONIZE";
    EnvKey["LoggerType"] = "LOGGER_TYPE";
})(EnvKey || (exports.EnvKey = EnvKey = {}));
//# sourceMappingURL=env-key.js.map