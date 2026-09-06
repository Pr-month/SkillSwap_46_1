import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

import { ExceptionCode, exceptionCodes } from '../errors/error-codes';

interface ErrorBody {
  code: ExceptionCode;
  message: string | string[];
  details?: unknown;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();

    const { status, body } = this.toHttpError(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logError(exception, request, status);
    }

    response.status(status).json({
      ...body,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.originalUrl ?? request.url,
    });
  }

  private toHttpError(exception: unknown): {
    status: HttpStatus;
    body: ErrorBody;
  } {
    if (exception instanceof EntityNotFoundError) {
      return this.createError(
        HttpStatus.NOT_FOUND,
        exceptionCodes.common.notFound,
      );
    }

    if (this.isUniqueViolation(exception)) {
      return this.createError(
        HttpStatus.CONFLICT,
        exceptionCodes.common.conflict,
      );
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const fallbackCode = this.codeByStatus(status);

      if (typeof response === 'string') {
        return { status, body: { code: fallbackCode, message: response } };
      }

      const payload = response as Record<string, unknown>;
      const code =
        typeof payload.code === 'string' && payload.code in exceptionCodes
          ? (payload.code as ExceptionCode)
          : fallbackCode;

      const message =
        typeof payload.message === 'string' || Array.isArray(payload.message)
          ? (payload.message as string | string[])
          : code;

      return {
        status,
        body: {
          code,
          message,
          ...(payload.details === undefined
            ? {}
            : { details: payload.details }),
        },
      };
    }

    return this.createError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      exceptionCodes.common.internal,
    );
  }

  private createError(status: HttpStatus, code: ExceptionCode) {
    return { status, body: { code, message: code } };
  }

  private codeByStatus(status: number): ExceptionCode {
    const codes: Partial<Record<HttpStatus, ExceptionCode>> = {
      [HttpStatus.BAD_REQUEST]: exceptionCodes.common.validation,
      [HttpStatus.UNAUTHORIZED]: exceptionCodes.common.unauthorized,
      [HttpStatus.FORBIDDEN]: exceptionCodes.common.forbidden,
      [HttpStatus.NOT_FOUND]: exceptionCodes.common.notFound,
      [HttpStatus.CONFLICT]: exceptionCodes.common.conflict,
      [HttpStatus.PAYLOAD_TOO_LARGE]: exceptionCodes.common.payloadTooLarge,
    };

    return codes[status] ?? exceptionCodes.common.internal;
  }

  private isUniqueViolation(exception: unknown): boolean {
    if (!(exception instanceof QueryFailedError)) {
      return false;
    }

    const driverError = exception.driverError as { code?: string };
    return driverError.code === '23505';
  }

  private logError(exception: unknown, request: Request, status: number): void {
    const path = request.originalUrl ?? request.url;
    const method = request.method;
    const ip = this.getClientIp(request);

    const message =
      exception instanceof Error ? exception.message : 'Unknown server error';

    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(
      `${method} ${path} | ${status} | IP: ${ip} | ${message}`,
      stack,
    );
  }

  private getClientIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (typeof forwardedFor === 'string') {
      return forwardedFor.split(',')[0].trim();
    }

    return request.ip ?? request.socket.remoteAddress ?? 'unknown';
  }
}
