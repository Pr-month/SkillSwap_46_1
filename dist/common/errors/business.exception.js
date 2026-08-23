"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessException = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("./error-codes");
class BusinessException extends common_1.HttpException {
    constructor(code, status = common_1.HttpStatus.BAD_REQUEST, details) {
        super(Object.assign({ code, message: error_codes_1.exceptionMessages[code] }, (details === undefined ? {} : { details })), status);
        this.code = code;
        this.details = details;
    }
}
exports.BusinessException = BusinessException;
//# sourceMappingURL=business.exception.js.map