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
exports.UpdateRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const request_status_enum_1 = require("../enums/request-status.enum");
class UpdateRequestDto {
}
exports.UpdateRequestDto = UpdateRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: [request_status_enum_1.RequestStatus.ACCEPTED, request_status_enum_1.RequestStatus.REJECTED],
    }),
    (0, class_validator_1.IsIn)([request_status_enum_1.RequestStatus.ACCEPTED, request_status_enum_1.RequestStatus.REJECTED]),
    __metadata("design:type", String)
], UpdateRequestDto.prototype, "status", void 0);
//# sourceMappingURL=update-request.dto.js.map