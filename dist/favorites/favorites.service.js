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
exports.FavoritesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_exception_1 = require("../common/errors/business.exception");
const error_codes_1 = require("../common/errors/error-codes");
const favorite_entity_1 = require("../skills/entities/favorite.entity");
const skills_entity_1 = require("../skills/entities/skills.entity");
let FavoritesService = class FavoritesService {
    constructor(favoriteRepository, skillRepository) {
        this.favoriteRepository = favoriteRepository;
        this.skillRepository = skillRepository;
        this.skillRelations = {
            category: true,
            subcategory: true,
            owner: true,
        };
    }
    add(userId, skillId) {
        return __awaiter(this, void 0, void 0, function* () {
            const skill = yield this.skillRepository.findOne({
                where: { id: skillId },
                relations: this.skillRelations,
            });
            if (!skill) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.skills.notFound, common_1.HttpStatus.NOT_FOUND, { skillId });
            }
            const existingFavorite = yield this.favoriteRepository.findOne({
                where: { userId, skillId },
            });
            if (existingFavorite) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.favorites.alreadyExists, common_1.HttpStatus.CONFLICT);
            }
            const favorite = yield this.favoriteRepository.save(this.favoriteRepository.create({ userId, skillId }));
            return this.toDto(favorite, skill);
        });
    }
    remove(userId, skillId) {
        return __awaiter(this, void 0, void 0, function* () {
            const favorite = yield this.favoriteRepository.findOne({
                where: { userId, skillId },
            });
            if (!favorite) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.favorites.notFound, common_1.HttpStatus.NOT_FOUND);
            }
            yield this.favoriteRepository.remove(favorite);
        });
    }
    findAll(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const favorites = yield this.favoriteRepository.find({
                where: { userId },
                relations: {
                    skill: {
                        category: true,
                        subcategory: true,
                        owner: true,
                    },
                },
                order: { createdAt: 'DESC' },
            });
            return favorites.map((favorite) => this.toDto(favorite, favorite.skill));
        });
    }
    check(userId, skillId) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield this.favoriteRepository.count({
                where: { userId, skillId },
            });
            return { isFavorite: count > 0 };
        });
    }
    toDto(favorite, skill) {
        var _a, _b, _c, _d;
        return {
            id: favorite.id,
            userId: favorite.userId,
            skillId: favorite.skillId,
            createdAt: favorite.createdAt.toISOString(),
            skill: {
                id: skill.id,
                title: skill.title,
                description: skill.description,
                images: (_a = skill.images) !== null && _a !== void 0 ? _a : [],
                category: (_c = (_b = skill.category) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : '',
                subcategory: (_d = skill.subcategory) === null || _d === void 0 ? void 0 : _d.name,
                owner: skill.owner
                    ? {
                        id: skill.owner.id,
                        name: skill.owner.name,
                        avatar: skill.owner.avatar,
                    }
                    : undefined,
            },
        };
    }
};
exports.FavoritesService = FavoritesService;
exports.FavoritesService = FavoritesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(favorite_entity_1.Favorite)),
    __param(1, (0, typeorm_1.InjectRepository)(skills_entity_1.Skill)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FavoritesService);
//# sourceMappingURL=favorites.service.js.map