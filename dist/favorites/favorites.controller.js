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
exports.MyFavoritesController = exports.FavoritesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const favorite_response_dto_1 = require("./dto/favorite-response.dto");
const favorites_service_1 = require("./favorites.service");
let FavoritesController = class FavoritesController {
    constructor(favoritesService) {
        this.favoritesService = favoritesService;
    }
    add(req, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.favoritesService.add(req.user.id, id);
        });
    }
    remove(req, id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.favoritesService.remove(req.user.id, id);
        });
    }
};
exports.FavoritesController = FavoritesController;
__decorate([
    (0, common_1.Post)(':id/favorite'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Добавить навык в избранное' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: favorite_response_dto_1.FavoriteDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "add", null);
__decorate([
    (0, common_1.Delete)(':id/favorite'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Удалить навык из избранного' }),
    (0, swagger_1.ApiResponse)({ status: 204 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "remove", null);
exports.FavoritesController = FavoritesController = __decorate([
    (0, swagger_1.ApiTags)('favorites'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('skills'),
    __metadata("design:paramtypes", [favorites_service_1.FavoritesService])
], FavoritesController);
let MyFavoritesController = class MyFavoritesController {
    constructor(favoritesService) {
        this.favoritesService = favoritesService;
    }
    findAll(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.favoritesService.findAll(req.user.id);
        });
    }
    check(req, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.favoritesService.check(req.user.id, id);
        });
    }
};
exports.MyFavoritesController = MyFavoritesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Получить список избранных навыков текущего пользователя',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [favorite_response_dto_1.FavoriteDto] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MyFavoritesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/check'),
    (0, swagger_1.ApiOperation)({
        summary: 'Проверить, находится ли навык в избранном у пользователя',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, type: favorite_response_dto_1.FavoriteCheckDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MyFavoritesController.prototype, "check", null);
exports.MyFavoritesController = MyFavoritesController = __decorate([
    (0, swagger_1.ApiTags)('favorites'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('favorites'),
    __metadata("design:paramtypes", [favorites_service_1.FavoritesService])
], MyFavoritesController);
//# sourceMappingURL=favorites.controller.js.map