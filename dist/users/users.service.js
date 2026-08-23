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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = __importStar(require("bcrypt"));
const typeorm_2 = require("typeorm");
const business_exception_1 = require("../common/errors/business.exception");
const error_codes_1 = require("../common/errors/error-codes");
const configuration_service_1 = require("../module/configuration/configuration.service");
const user_entity_1 = require("./entities/user.entity");
let UsersService = class UsersService {
    constructor(usersRepository, configurationService) {
        this.usersRepository = usersRepository;
        this.configurationService = configurationService;
    }
    toProfileResponse(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            birthDate: user.birthdate,
            gender: user.gender,
            city: user.city,
            avatar: user.avatar,
            about: user.about,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    create(createUserData) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this.usersRepository.create(createUserData);
            return this.usersRepository.save(user);
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.usersRepository.findOne({
                where: { email },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.usersRepository.findOne({
                where: { id },
            });
        });
    }
    updateRefreshToken(id, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.usersRepository.update({ id }, { refreshToken });
            if (!result.affected) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.users.notFound, common_1.HttpStatus.NOT_FOUND);
            }
        });
    }
    clearRefreshToken(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateRefreshToken(id, null);
        });
    }
    updatePassword(id, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.usersRepository.update({ id }, { password });
            if (!result.affected) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.users.notFound, common_1.HttpStatus.NOT_FOUND);
            }
        });
    }
    getProfile(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.findById(id);
            if (!user) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.users.notFound, common_1.HttpStatus.NOT_FOUND);
            }
            return this.toProfileResponse(user);
        });
    }
    updateProfile(id, updateUserDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.usersRepository.preload(Object.assign({ id }, updateUserDto));
            if (!user) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.users.notFound, common_1.HttpStatus.NOT_FOUND);
            }
            const updatedUser = yield this.usersRepository.save(user);
            return this.toProfileResponse(updatedUser);
        });
    }
    changePassword(id, changePasswordDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.findById(id);
            if (!user) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.users.notFound, common_1.HttpStatus.NOT_FOUND);
            }
            const passwordMatches = yield bcrypt.compare(changePasswordDto.currentPassword, user.password);
            if (!passwordMatches) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.users.invalidCredentials, common_1.HttpStatus.UNAUTHORIZED);
            }
            const hashedPassword = yield bcrypt.hash(changePasswordDto.newPassword, this.configurationService.hashSalt);
            yield this.updatePassword(id, hashedPassword);
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        configuration_service_1.ConfigurationService])
], UsersService);
//# sourceMappingURL=users.service.js.map