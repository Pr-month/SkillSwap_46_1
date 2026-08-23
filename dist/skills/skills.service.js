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
exports.SkillsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("../categories/entities/category.entity");
const subcategory_entity_1 = require("../categories/entities/subcategory.entity");
const response_dto_1 = require("../common/dto/response.dto");
const business_exception_1 = require("../common/errors/business.exception");
const error_codes_1 = require("../common/errors/error-codes");
const skills_entity_1 = require("./entities/skills.entity");
let SkillsService = class SkillsService {
    constructor(skillsRepository, categoriesRepository, subcategoriesRepository) {
        this.skillsRepository = skillsRepository;
        this.categoriesRepository = categoriesRepository;
        this.subcategoriesRepository = subcategoriesRepository;
        this.publicOwnerColumns = [
            'owner.id',
            'owner.name',
            'owner.about',
            'owner.birthdate',
            'owner.city',
            'owner.gender',
            'owner.avatar',
        ];
    }
    create(ownerId, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            yield this.validateCategory(dto.categoryId, dto.subcategoryId);
            const skill = this.skillsRepository.create(Object.assign(Object.assign({}, dto), { images: (_a = dto.images) !== null && _a !== void 0 ? _a : null, subcategoryId: (_b = dto.subcategoryId) !== null && _b !== void 0 ? _b : null, ownerId, owner: { id: ownerId } }));
            return this.skillsRepository.save(skill);
        });
    }
    findAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const builder = this.skillsRepository
                .createQueryBuilder('skill')
                .leftJoinAndSelect('skill.category', 'category')
                .leftJoinAndSelect('skill.subcategory', 'subcategory')
                .leftJoin('skill.owner', 'owner')
                .addSelect(this.publicOwnerColumns)
                .orderBy('skill.createdAt', 'DESC')
                .skip(query.skip)
                .take(query.limit);
            if (query.search) {
                builder.andWhere(new typeorm_2.Brackets((where) => {
                    where
                        .where('LOWER(skill.title) LIKE :search')
                        .orWhere('LOWER(category.name) LIKE :search')
                        .orWhere('LOWER(subcategory.name) LIKE :search');
                }), { search: `%${query.search.toLowerCase()}%` });
            }
            if (query.category) {
                builder.andWhere(new typeorm_2.Brackets((where) => {
                    where
                        .where('category.id::text = :category')
                        .orWhere('subcategory.id::text = :category')
                        .orWhere('LOWER(category.name) = LOWER(:category)')
                        .orWhere('LOWER(subcategory.name) = LOWER(:category)');
                }), { category: query.category });
            }
            const [skills, total] = yield builder.getManyAndCount();
            const totalPages = Math.ceil(total / query.limit);
            if (query.page > Math.max(totalPages, 1)) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.skills.notFound, common_1.HttpStatus.NOT_FOUND);
            }
            return new response_dto_1.PaginatedResponseDto(skills, query.page, total, query.limit);
        });
    }
    findOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const skill = yield this.skillsRepository
                .createQueryBuilder('skill')
                .leftJoinAndSelect('skill.category', 'category')
                .leftJoinAndSelect('skill.subcategory', 'subcategory')
                .leftJoin('skill.owner', 'owner')
                .addSelect(this.publicOwnerColumns)
                .where('skill.id = :id', { id })
                .getOne();
            if (!skill) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.skills.notFound, common_1.HttpStatus.NOT_FOUND);
            }
            return skill;
        });
    }
    update(id, ownerId, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const skill = yield this.findOne(id);
            this.assertOwner(skill, ownerId);
            const categoryId = (_a = dto.categoryId) !== null && _a !== void 0 ? _a : skill.categoryId;
            const subcategoryId = dto.subcategoryId === undefined
                ? ((_b = skill.subcategoryId) !== null && _b !== void 0 ? _b : undefined)
                : dto.subcategoryId;
            yield this.validateCategory(categoryId, subcategoryId);
            Object.assign(skill, dto);
            return this.skillsRepository.save(skill);
        });
    }
    remove(id, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const skill = yield this.findOne(id);
            this.assertOwner(skill, ownerId);
            yield this.skillsRepository.remove(skill);
        });
    }
    assertOwner(skill, ownerId) {
        if (skill.ownerId !== ownerId) {
            throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.skills.accessDenied, common_1.HttpStatus.FORBIDDEN);
        }
    }
    validateCategory(categoryId, subcategoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const category = yield this.categoriesRepository.findOneBy({
                id: categoryId,
            });
            if (!category) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.categories.notFound, common_1.HttpStatus.NOT_FOUND);
            }
            if (!subcategoryId)
                return;
            const subcategory = yield this.subcategoriesRepository.findOneBy({
                id: subcategoryId,
                categoryId,
            });
            if (!subcategory) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.categories.subcategoryNotFound, common_1.HttpStatus.NOT_FOUND);
            }
        });
    }
};
exports.SkillsService = SkillsService;
exports.SkillsService = SkillsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(skills_entity_1.Skill)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(2, (0, typeorm_1.InjectRepository)(subcategory_entity_1.Subcategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SkillsService);
//# sourceMappingURL=skills.service.js.map