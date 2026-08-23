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
exports.FavoriteCheckDto = exports.FavoriteDto = exports.FavoriteSkillDto = exports.FavoriteSkillOwnerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class FavoriteSkillOwnerDto {
}
exports.FavoriteSkillOwnerDto = FavoriteSkillOwnerDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'b3f1c2b0-4a2e-4c3f-9b7a-1e2d3c4b5a6f',
        description: 'ID автора навыка',
    }),
    __metadata("design:type", String)
], FavoriteSkillOwnerDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Иван Петров',
        description: 'Имя автора навыка',
    }),
    __metadata("design:type", String)
], FavoriteSkillOwnerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'https://example.com/avatar.jpg',
        description: 'URL аватара автора навыка',
        nullable: true,
    }),
    __metadata("design:type", Object)
], FavoriteSkillOwnerDto.prototype, "avatar", void 0);
class FavoriteSkillDto {
}
exports.FavoriteSkillDto = FavoriteSkillDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'e8f0a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b',
        description: 'ID навыка',
    }),
    __metadata("design:type", String)
], FavoriteSkillDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Мастер-класс по игре на гитаре',
        description: 'Название навыка',
    }),
    __metadata("design:type", String)
], FavoriteSkillDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Научу играть на гитаре с нуля за 5 занятий',
        description: 'Описание навыка',
    }),
    __metadata("design:type", String)
], FavoriteSkillDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [String],
        example: ['https://example.com/skill-image-1.jpg'],
        description: 'Изображения навыка',
    }),
    __metadata("design:type", Array)
], FavoriteSkillDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Творчество и искусство',
        description: 'Название категории',
    }),
    __metadata("design:type", String)
], FavoriteSkillDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Игра на гитаре',
        description: 'Название подкатегории',
    }),
    __metadata("design:type", String)
], FavoriteSkillDto.prototype, "subcategory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: () => FavoriteSkillOwnerDto,
        description: 'Автор навыка',
    }),
    __metadata("design:type", FavoriteSkillOwnerDto)
], FavoriteSkillDto.prototype, "owner", void 0);
class FavoriteDto {
}
exports.FavoriteDto = FavoriteDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
        description: 'ID записи избранного',
    }),
    __metadata("design:type", String)
], FavoriteDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'b3f1c2b0-4a2e-4c3f-9b7a-1e2d3c4b5a6f',
        description: 'ID пользователя',
    }),
    __metadata("design:type", String)
], FavoriteDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'e8f0a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b',
        description: 'ID навыка',
    }),
    __metadata("design:type", String)
], FavoriteDto.prototype, "skillId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-01-01T12:00:00.000Z',
        description: 'Дата добавления навыка в избранное',
    }),
    __metadata("design:type", String)
], FavoriteDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: () => FavoriteSkillDto,
        description: 'Детальная информация о навыке',
    }),
    __metadata("design:type", FavoriteSkillDto)
], FavoriteDto.prototype, "skill", void 0);
class FavoriteCheckDto {
}
exports.FavoriteCheckDto = FavoriteCheckDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Находится ли навык в избранном у текущего пользователя',
    }),
    __metadata("design:type", Boolean)
], FavoriteCheckDto.prototype, "isFavorite", void 0);
//# sourceMappingURL=favorite-response.dto.js.map