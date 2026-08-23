"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const ms_1 = __importDefault(require("ms"));
const business_exception_1 = require("../common/errors/business.exception");
const error_codes_1 = require("../common/errors/error-codes");
const configuration_service_1 = require("../module/configuration/configuration.service");
const user_enums_1 = require("../users/enums/user.enums");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    register(registerDto, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const existingUser = yield this.usersService.findByEmail(registerDto.email);
            if (existingUser) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.users.alreadyExists, common_1.HttpStatus.CONFLICT);
            }
            const hashedPassword = yield bcrypt.hash(registerDto.password, this.configService.hashSalt);
            const wantToLearn = registerDto.wantToLearn
                ? registerDto.wantToLearn.map((id) => ({ id }))
                : [];
            const skills = registerDto.skills
                ? registerDto.skills.map((id) => ({ id }))
                : [];
            const createUserData = Object.assign(Object.assign({}, registerDto), { password: hashedPassword, birthdate: new Date(registerDto.birthdate), gender: (_a = registerDto.gender) !== null && _a !== void 0 ? _a : user_enums_1.UserGender.OTHER, city: registerDto.city, avatar: registerDto.avatar, role: user_enums_1.UserRole.USER, about: (_b = registerDto.about) !== null && _b !== void 0 ? _b : null, wantToLearn,
                skills });
            const user = yield this.usersService.create(createUserData);
            const tokens = yield this.generateTokens(user.id, user.email);
            yield this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
            this.setAuthCookies(res, tokens);
            return user;
        });
    }
    validateUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.usersService.findByEmail(email);
            if (user && (yield bcrypt.compare(password, user.password))) {
                return { id: user.id, email: user.email };
            }
            return null;
        });
    }
    login(user, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokens = yield this.generateTokens(user.id, user.email);
            yield this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
            this.setAuthCookies(res, tokens);
            const fullUser = yield this.usersService.findById(user.id);
            return fullUser;
        });
    }
    logout(userId, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.usersService.clearRefreshToken(userId);
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return { message: 'Успешный выход' };
        });
    }
    updatePassword(userId, updatePasswordDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcrypt.hash(updatePasswordDto.newPassword, this.configService.hashSalt);
            yield this.usersService.updatePassword(userId, hashedPassword);
            return { message: 'Пароль успешно обновлен' };
        });
    }
    getProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.usersService.findById(userId);
            return user;
        });
    }
    generateTokens(userId, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const [accessToken, refreshToken] = yield Promise.all([
                this.jwtService.signAsync({ sub: userId, email, tokenType: 'access' }, { expiresIn: this.configService.jwtAccessExpiresIn }),
                this.jwtService.signAsync({ sub: userId, email, tokenType: 'refresh' }, {
                    expiresIn: this.configService.jwtRefreshExpiresIn,
                    secret: this.configService.jwtRefreshSecret,
                }),
            ]);
            return { accessToken, refreshToken };
        });
    }
    setAuthCookies(res, tokens) {
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: (0, ms_1.default)(this.configService.jwtAccessExpiresIn),
        });
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: (0, ms_1.default)(this.configService.jwtRefreshExpiresIn),
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        configuration_service_1.ConfigurationService])
], AuthService);
//# sourceMappingURL=auth.service.js.map