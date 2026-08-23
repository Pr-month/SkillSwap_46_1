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
exports.UserProfileResponse = void 0;
const swagger_1 = require("@nestjs/swagger");
const user_enums_1 = require("../enums/user.enums");
class UserProfileResponse {
}
exports.UserProfileResponse = UserProfileResponse;
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'uuid' }),
    __metadata("design:type", String)
], UserProfileResponse.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    __metadata("design:type", String)
], UserProfileResponse.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Иван Иванов' }),
    __metadata("design:type", String)
], UserProfileResponse.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, format: 'date' }),
    __metadata("design:type", Date)
], UserProfileResponse.prototype, "birthDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_enums_1.UserGender }),
    __metadata("design:type", String)
], UserProfileResponse.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Москва' }),
    __metadata("design:type", String)
], UserProfileResponse.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'https://example.com/avatar.jpg',
        nullable: true,
    }),
    __metadata("design:type", Object)
], UserProfileResponse.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], UserProfileResponse.prototype, "about", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_enums_1.UserRole }),
    __metadata("design:type", String)
], UserProfileResponse.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, format: 'date-time' }),
    __metadata("design:type", Date)
], UserProfileResponse.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, format: 'date-time' }),
    __metadata("design:type", Date)
], UserProfileResponse.prototype, "updatedAt", void 0);
//# sourceMappingURL=user-profile.response.js.map