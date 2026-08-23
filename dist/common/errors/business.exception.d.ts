import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionCode } from './error-codes';
export declare class BusinessException extends HttpException {
    readonly code: ExceptionCode;
    readonly details?: unknown | undefined;
    constructor(code: ExceptionCode, status?: HttpStatus, details?: unknown | undefined);
}
