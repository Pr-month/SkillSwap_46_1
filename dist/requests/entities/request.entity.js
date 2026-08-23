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
exports.Request = void 0;
const typeorm_1 = require("typeorm");
const skills_entity_1 = require("../../skills/entities/skills.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const request_status_enum_1 = require("../enums/request-status.enum");
let Request = class Request {
};
exports.Request = Request;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Request.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Request.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'senderId' }),
    __metadata("design:type", user_entity_1.User)
], Request.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'receiverId' }),
    __metadata("design:type", user_entity_1.User)
], Request.prototype, "receiver", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: request_status_enum_1.RequestStatus,
        default: request_status_enum_1.RequestStatus.PENDING,
    }),
    __metadata("design:type", String)
], Request.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => skills_entity_1.Skill, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'offeredSkillId' }),
    __metadata("design:type", skills_entity_1.Skill)
], Request.prototype, "offeredSkill", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => skills_entity_1.Skill, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'requestedSkillId' }),
    __metadata("design:type", skills_entity_1.Skill)
], Request.prototype, "requestedSkill", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Request.prototype, "isRead", void 0);
exports.Request = Request = __decorate([
    (0, typeorm_1.Entity)('requests'),
    (0, typeorm_1.Index)('IDX_requests_status', ['status']),
    (0, typeorm_1.Index)('IDX_requests_sender_status', ['sender', 'status']),
    (0, typeorm_1.Index)('IDX_requests_receiver_status', ['receiver', 'status'])
], Request);
//# sourceMappingURL=request.entity.js.map