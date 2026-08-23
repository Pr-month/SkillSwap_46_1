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
exports.RequestsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_exception_1 = require("../common/errors/business.exception");
const error_codes_1 = require("../common/errors/error-codes");
const skills_entity_1 = require("../skills/entities/skills.entity");
const user_entity_1 = require("../users/entities/user.entity");
const user_enums_1 = require("../users/enums/user.enums");
const request_entity_1 = require("./entities/request.entity");
const request_status_enum_1 = require("./enums/request-status.enum");
const requests_select_1 = require("./requests.select");
const ACTIVE_STATUSES = [request_status_enum_1.RequestStatus.PENDING, request_status_enum_1.RequestStatus.IN_PROGRESS];
let RequestsService = class RequestsService {
    constructor(requestsRepository, skillsRepository, usersRepository, dataSource) {
        this.requestsRepository = requestsRepository;
        this.skillsRepository = skillsRepository;
        this.usersRepository = usersRepository;
        this.dataSource = dataSource;
    }
    create(senderId, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const [offeredSkill, requestedSkill] = yield Promise.all([
                this.findSkill(dto.offeredSkillId),
                this.findSkill(dto.requestedSkillId),
            ]);
            if (offeredSkill.ownerId !== senderId) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.requests.accessDenied, common_1.HttpStatus.FORBIDDEN);
            }
            if (requestedSkill.ownerId === senderId) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.requests.selfRequest, common_1.HttpStatus.BAD_REQUEST);
            }
            const request = this.requestsRepository.create({
                sender: { id: senderId },
                receiver: { id: requestedSkill.ownerId },
                offeredSkill,
                requestedSkill,
            });
            return this.requestsRepository.save(request);
        });
    }
    findIncoming(userId) {
        return this.requestsRepository.find({
            where: {
                receiver: { id: userId },
                status: (0, typeorm_2.In)(ACTIVE_STATUSES),
            },
            relations: requests_select_1.REQUEST_RELATIONS,
            select: requests_select_1.PUBLIC_REQUEST_FIELDS,
            order: { createdAt: 'DESC' },
        });
    }
    findOutgoing(userId) {
        return this.requestsRepository.find({
            where: {
                sender: { id: userId },
                status: (0, typeorm_2.In)(ACTIVE_STATUSES),
            },
            relations: requests_select_1.REQUEST_RELATIONS,
            select: requests_select_1.PUBLIC_REQUEST_FIELDS,
            order: { createdAt: 'DESC' },
        });
    }
    update(id, receiverId, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield this.findOne(id);
            if (request.receiver.id !== receiverId) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.requests.accessDenied, common_1.HttpStatus.FORBIDDEN);
            }
            if (!ACTIVE_STATUSES.includes(request.status)) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.requests.invalidStatus, common_1.HttpStatus.CONFLICT);
            }
            request.status = dto.status;
            request.isRead = true;
            if (dto.status === request_status_enum_1.RequestStatus.ACCEPTED) {
                request.offeredSkill.ownerId = request.receiver.id;
                request.offeredSkill.owner = request.receiver;
                request.requestedSkill.ownerId = request.sender.id;
                request.requestedSkill.owner = request.sender;
                return this.dataSource.transaction((manager) => __awaiter(this, void 0, void 0, function* () {
                    yield manager.save(skills_entity_1.Skill, [
                        request.offeredSkill,
                        request.requestedSkill,
                    ]);
                    return manager.save(request_entity_1.Request, request);
                }));
            }
            return this.requestsRepository.save(request);
        });
    }
    remove(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [request, user] = yield Promise.all([
                this.findOne(id),
                this.usersRepository.findOneBy({ id: userId }),
            ]);
            if (request.sender.id !== userId && (user === null || user === void 0 ? void 0 : user.role) !== user_enums_1.UserRole.ADMIN) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.requests.accessDenied, common_1.HttpStatus.FORBIDDEN);
            }
            yield this.requestsRepository.remove(request);
        });
    }
    findOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield this.requestsRepository.findOne({
                where: { id },
                relations: requests_select_1.REQUEST_RELATIONS,
                select: requests_select_1.PUBLIC_REQUEST_FIELDS,
            });
            if (!request) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.requests.notFound, common_1.HttpStatus.NOT_FOUND);
            }
            return request;
        });
    }
    findSkill(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const skill = yield this.skillsRepository.findOne({
                where: { id },
            });
            if (!skill) {
                throw new business_exception_1.BusinessException(error_codes_1.exceptionCodes.skills.notFound, common_1.HttpStatus.NOT_FOUND);
            }
            return skill;
        });
    }
};
exports.RequestsService = RequestsService;
exports.RequestsService = RequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(request_entity_1.Request)),
    __param(1, (0, typeorm_1.InjectRepository)(skills_entity_1.Skill)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], RequestsService);
//# sourceMappingURL=requests.service.js.map