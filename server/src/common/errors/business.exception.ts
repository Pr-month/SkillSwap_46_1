import { HttpException, HttpStatus } from '@nestjs/common';

import { ExceptionCode } from './error-codes';

export class BusinessException extends HttpException {
  constructor(
    public readonly code: ExceptionCode,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly details?: unknown,
  ) {
    super(
      {
        code,
        message: code,
        ...(details === undefined ? {} : { details }),
      },
      status,
    );
  }
}
