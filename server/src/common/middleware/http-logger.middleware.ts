import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HttpLoggerMiddleware.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const startedAt = process.hrtime.bigint();

    response.on('finish', () => {
      const durationInNanoseconds = process.hrtime.bigint() - startedAt;
      const durationInMilliseconds = Number(durationInNanoseconds) / 1_000_000;

      const method = request.method;
      const path = request.originalUrl ?? request.url;
      const statusCode = response.statusCode;
      const ip = this.getClientIp(request);
      const userAgent = request.get('user-agent') ?? 'unknown';

      this.logger.log(
        `${method} ${path} | ${statusCode} | IP: ${ip} | ${durationInMilliseconds.toFixed(2)}ms | ${userAgent}`,
      );
    });

    next();
  }

  private getClientIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (typeof forwardedFor === 'string') {
      return forwardedFor.split(',')[0].trim();
    }

    return request.ip ?? request.socket.remoteAddress ?? 'unknown';
  }
}
