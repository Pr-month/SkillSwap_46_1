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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentVariables = void 0;
const const_1 = require("../const");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class EnvironmentVariables {
}
exports.EnvironmentVariables = EnvironmentVariables;
_a = const_1.EnvKey.NodeEnv, _b = const_1.EnvKey.Port, _c = const_1.EnvKey.HashSalt, _d = const_1.EnvKey.JwtAccessSecret, _e = const_1.EnvKey.JwtRefreshSecret, _f = const_1.EnvKey.JwtAccessExpiresIn, _g = const_1.EnvKey.JwtRefreshExpiresIn, _h = const_1.EnvKey.DatabaseHost, _j = const_1.EnvKey.DatabasePort, _k = const_1.EnvKey.DatabaseUsername, _l = const_1.EnvKey.DatabasePassword, _m = const_1.EnvKey.DatabaseName, _o = const_1.EnvKey.DatabaseSynchronize, _p = const_1.EnvKey.LoggerType;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(const_1.nodeEnvValues),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, _a, void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(65535),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, _b, void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, _c, void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, _d, void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, _e, void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, _f, void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, _g, void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, _h, void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(65535),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, _j, void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, _k, void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, _l, void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, _m, void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true' || value === '1')
            return true;
        if (value === 'false' || value === '0')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], EnvironmentVariables.prototype, _o, void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['dev', 'production', 'test', 'combined', 'console']),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, _p, void 0);
//# sourceMappingURL=environment-variables.model.js.map