"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const error_codes_1 = require("../errors/error-codes");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    constructor() {
        this.logger = new common_1.Logger(AllExceptionsFilter_1.name);
    }
    catch(exception, host) {
        var _a;
        const http = host.switchToHttp();
        const response = http.getResponse();
        const request = http.getRequest();
        const { status, body } = this.toHttpError(exception);
        if (status === common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(exception);
        }
        response.status(status).json(Object.assign(Object.assign({}, body), { statusCode: status, timestamp: new Date().toISOString(), path: (_a = request.originalUrl) !== null && _a !== void 0 ? _a : request.url }));
    }
    toHttpError(exception) {
        if (exception instanceof typeorm_1.EntityNotFoundError) {
            return this.createError(common_1.HttpStatus.NOT_FOUND, error_codes_1.exceptionCodes.common.notFound);
        }
        if (this.isUniqueViolation(exception)) {
            return this.createError(common_1.HttpStatus.CONFLICT, error_codes_1.exceptionCodes.common.conflict);
        }
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const response = exception.getResponse();
            const fallbackCode = this.codeByStatus(status);
            if (typeof response === 'string') {
                return { status, body: { code: fallbackCode, message: response } };
            }
            const payload = response;
            const code = (0, error_codes_1.isExceptionCode)(payload.code) ? payload.code : fallbackCode;
            const message = typeof payload.message === 'string' || Array.isArray(payload.message)
                ? payload.message
                : error_codes_1.exceptionMessages[code];
            return {
                status,
                body: Object.assign({ code,
                    message }, (payload.details === undefined
                    ? {}
                    : { details: payload.details })),
            };
        }
        return this.createError(common_1.HttpStatus.INTERNAL_SERVER_ERROR, error_codes_1.exceptionCodes.common.internal);
    }
    createError(status, code) {
        return { status, body: { code, message: error_codes_1.exceptionMessages[code] } };
    }
    codeByStatus(status) {
        var _a;
        const codes = {
            [common_1.HttpStatus.BAD_REQUEST]: error_codes_1.exceptionCodes.common.validation,
            [common_1.HttpStatus.UNAUTHORIZED]: error_codes_1.exceptionCodes.common.unauthorized,
            [common_1.HttpStatus.FORBIDDEN]: error_codes_1.exceptionCodes.common.forbidden,
            [common_1.HttpStatus.NOT_FOUND]: error_codes_1.exceptionCodes.common.notFound,
            [common_1.HttpStatus.CONFLICT]: error_codes_1.exceptionCodes.common.conflict,
            [common_1.HttpStatus.PAYLOAD_TOO_LARGE]: error_codes_1.exceptionCodes.common.payloadTooLarge,
        };
        return (_a = codes[status]) !== null && _a !== void 0 ? _a : error_codes_1.exceptionCodes.common.internal;
    }
    isUniqueViolation(exception) {
        if (!(exception instanceof typeorm_1.QueryFailedError)) {
            return false;
        }
        const driverError = exception.driverError;
        return driverError.code === '23505';
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map