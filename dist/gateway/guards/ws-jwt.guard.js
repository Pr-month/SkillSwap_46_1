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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsJwtGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const cookie_1 = require("cookie");
const error_codes_1 = require("../../common/errors/error-codes");
const configuration_service_1 = require("../../module/configuration/configuration.service");
let WsJwtGuard = class WsJwtGuard {
    constructor(jwtService, configurationService) {
        this.jwtService = jwtService;
        this.configurationService = configurationService;
    }
    canActivate(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = context.switchToWs().getClient();
            yield this.authenticate(client);
            return true;
        });
    }
    authenticate(client) {
        return __awaiter(this, void 0, void 0, function* () {
            const accessToken = this.extractAccessToken(client);
            if (!accessToken) {
                throw this.createWsException(error_codes_1.exceptionCodes.common.unauthorized);
            }
            try {
                const payload = yield this.jwtService.verifyAsync(accessToken, {
                    secret: this.configurationService.jwtAccessSecret,
                });
                if (payload.tokenType !== 'access' || !payload.sub || !payload.email) {
                    throw this.createWsException(error_codes_1.exceptionCodes.auth.invalidAccessToken);
                }
                const user = {
                    id: payload.sub,
                    email: payload.email,
                };
                client.data.user = user;
                return user;
            }
            catch (error) {
                if (error instanceof websockets_1.WsException) {
                    throw error;
                }
                if (error instanceof jwt_1.TokenExpiredError) {
                    throw this.createWsException(error_codes_1.exceptionCodes.auth.expiredAccessToken);
                }
                if (error instanceof jwt_1.NotBeforeError) {
                    throw this.createWsException(error_codes_1.exceptionCodes.auth.invalidAccessToken);
                }
                if (error instanceof jwt_1.JsonWebTokenError) {
                    throw this.createWsException(error_codes_1.exceptionCodes.auth.invalidAccessToken);
                }
                throw this.createWsException(error_codes_1.exceptionCodes.common.internal);
            }
        });
    }
    extractAccessToken(client) {
        var _a;
        const cookieHeader = client.handshake.headers.cookie;
        if (!cookieHeader) {
            return null;
        }
        try {
            const cookies = (0, cookie_1.parse)(cookieHeader);
            return (_a = cookies.accessToken) !== null && _a !== void 0 ? _a : null;
        }
        catch (_b) {
            return null;
        }
    }
    createWsException(code) {
        return new websockets_1.WsException({
            code,
            message: error_codes_1.exceptionMessages[code],
        });
    }
};
exports.WsJwtGuard = WsJwtGuard;
exports.WsJwtGuard = WsJwtGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        configuration_service_1.ConfigurationService])
], WsJwtGuard);
//# sourceMappingURL=ws-jwt.guard.js.map