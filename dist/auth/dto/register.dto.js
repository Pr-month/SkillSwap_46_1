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
exports.RegisterResponseDto = exports.RegisterDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const user_profile_response_1 = require("../../users/dto/user-profile.response");
const user_enums_1 = require("../../users/enums/user.enums");
class RegisterDto {
    constructor() {
        this.gender = user_enums_1.UserGender.OTHER;
    }
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'user@example.com',
        description: 'Email пользователя',
    }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'password123',
        minLength: 6,
        description: 'Пароль',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Иван Петров',
        description: 'Полное имя',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '1990-01-01',
        description: 'Дата рождения в формате YYYY-MM-DD',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "birthdate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: user_enums_1.UserGender,
        default: user_enums_1.UserGender.OTHER,
        description: 'Пол',
    }),
    (0, class_validator_1.IsEnum)(user_enums_1.UserGender),
    __metadata("design:type", String)
], RegisterDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Москва',
        description: 'Город',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/avatar.jpg',
        description: 'URL аватара',
    }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'О себе...',
        description: 'Краткая информация',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "about", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID категорий/навыков, которые пользователь хочет выучить',
        type: [String],
        example: ['550e8400-e29b-41d4-a716-446655440000'],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('all', { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], RegisterDto.prototype, "wantToLearn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID навыков, которыми пользователь может научить',
        type: [String],
        example: ['550e8400-e29b-41d4-a716-446655440001'],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('all', { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], RegisterDto.prototype, "skills", void 0);
class RegisterResponseDto {
}
exports.RegisterResponseDto = RegisterResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Статус ответа',
    }),
    __metadata("design:type", Boolean)
], RegisterResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT токен доступа',
    }),
    __metadata("design:type", String)
], RegisterResponseDto.prototype, "access_token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Профиль пользователя',
        type: user_profile_response_1.UserProfileResponse,
    }),
    __metadata("design:type", user_profile_response_1.UserProfileResponse)
], RegisterResponseDto.prototype, "user", void 0);
//# sourceMappingURL=register.dto.js.map