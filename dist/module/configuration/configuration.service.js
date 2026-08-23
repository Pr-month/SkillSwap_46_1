"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const const_1 = require("./const");
let ConfigurationService = class ConfigurationService {
    constructor(configService) {
        this.configService = configService;
    }
    get nodeEnv() {
        return this.configService.get(const_1.EnvKey.NodeEnv);
    }
    get port() {
        return this.configService.get(const_1.EnvKey.Port);
    }
    get hashSalt() {
        return this.configService.get(const_1.EnvKey.HashSalt);
    }
    get jwtAccessSecret() {
        return this.configService.get(const_1.EnvKey.JwtAccessSecret);
    }
    get jwtRefreshSecret() {
        return this.configService.get(const_1.EnvKey.JwtRefreshSecret);
    }
    get jwtAccessExpiresIn() {
        return this.configService.get(const_1.EnvKey.JwtAccessExpiresIn);
    }
    get jwtRefreshExpiresIn() {
        return this.configService.get(const_1.EnvKey.JwtRefreshExpiresIn);
    }
    get databaseHost() {
        return this.configService.get(const_1.EnvKey.DatabaseHost);
    }
    get databasePort() {
        return this.configService.get(const_1.EnvKey.DatabasePort);
    }
    get databaseUsername() {
        return this.configService.get(const_1.EnvKey.DatabaseUsername);
    }
    get databasePassword() {
        return this.configService.get(const_1.EnvKey.DatabasePassword);
    }
    get databaseName() {
        return this.configService.get(const_1.EnvKey.DatabaseName);
    }
    get databaseSynchronize() {
        return this.configService.get(const_1.EnvKey.DatabaseSynchronize);
    }
    get loggerType() {
        return this.configService.get(const_1.EnvKey.LoggerType);
    }
};
exports.ConfigurationService = ConfigurationService;
exports.ConfigurationService = ConfigurationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ConfigurationService);
//# sourceMappingURL=configuration.service.js.map