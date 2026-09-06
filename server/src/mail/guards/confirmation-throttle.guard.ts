import { BusinessException } from '@/common/errors/business.exception';
import { exceptionCodes } from '@/common/errors/error-codes';
import { THROTTLE_KEY } from '@/mail/decorators/throttle-key.decorator';
import { REDIS_CLIENT } from '@/redis/redis.module';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Redis } from 'ioredis';

interface ThrottleConfig {
  ttl: number;
  maxAttempts: number;
}

const THROTTLE_CONFIGS: Record<string, ThrottleConfig> = {
  confirmation: {
    ttl: 60 * 60,
    maxAttempts: 10,
  },
  'reset-password': {
    ttl: 60 * 60,
    maxAttempts: 10,
  },
};

@Injectable()
export class MailThrottleGuard implements CanActivate {
  private readonly logger = new Logger(MailThrottleGuard.name);

  @Inject(REDIS_CLIENT) private readonly redis: Redis;

  constructor(
    @Inject(REDIS_CLIENT) redis: Redis,
    private readonly reflector: Reflector,
  ) {
    this.redis = redis;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const throttleKey = this.reflector.get<string>(
      THROTTLE_KEY,
      context.getHandler(),
    );

    if (!throttleKey) {
      return true;
    }

    const config = THROTTLE_CONFIGS[throttleKey];
    if (!config) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip || request.socket.remoteAddress || 'unknown';

    const key = `mail:${throttleKey}:${ip}`;

    try {
      const attempts = await this.redis.get(key);
      const currentAttempts = attempts ? parseInt(attempts, 10) : 0;

      if (currentAttempts >= config.maxAttempts) {
        const ttl = await this.redis.ttl(key);
        const minutesLeft = Math.ceil(ttl / 60);

        throw new BusinessException(
          exceptionCodes.mail.tooManyRequests,
          HttpStatus.TOO_MANY_REQUESTS,
          `Превышен лимит отправки писем. Повторите через ${minutesLeft} мин.`,
        );
      }

      if (currentAttempts === 0) {
        await this.redis.set(key, '1', 'EX', config.ttl);
      } else {
        await this.redis.incr(key);
      }

      return true;
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }

      this.logger.error('Ошибка при проверке лимита отправки писем', error);
      return true;
    }
  }
}
