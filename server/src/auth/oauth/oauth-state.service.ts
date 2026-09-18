import { BusinessException } from '@/common/errors/business.exception';
import { exceptionCodes } from '@/common/errors/error-codes';
import { getBaseUrl } from '@/common/utils/get-base-url';
import { REDIS_CLIENT } from '@/redis/redis.module';
import { Inject, Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Request } from 'express';
import { Redis } from 'ioredis';

interface OAuthStatePayload {
  provider: string;
  returnUrl: string;
}

@Injectable()
export class OAuthStateService {
  private readonly ttl = 300;

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async generate(
    provider: string,
    allowedOrigins: string[],
    request: Request,
  ): Promise<string> {
    const state = randomBytes(32).toString('hex');

    const payload: OAuthStatePayload = {
      provider,
      returnUrl: getBaseUrl(allowedOrigins, request),
    };

    await this.redis.set(
      `oauth:state:${state}`,
      JSON.stringify(payload),
      'EX',
      this.ttl,
    );

    return state;
  }

  async consume(state: string): Promise<OAuthStatePayload> {
    const key = `oauth:state:${state}`;
    const raw = await this.redis.get(key);

    if (!raw) {
      throw new BusinessException(
        exceptionCodes.auth.oauthStateInvalid,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.redis.del(key);

    return JSON.parse(raw) as OAuthStatePayload;
  }

  async peek(state: string): Promise<OAuthStatePayload> {
    const raw = await this.redis.get(`oauth:state:${state}`);

    if (!raw) {
      throw new BusinessException(
        exceptionCodes.auth.oauthStateInvalid,
        HttpStatus.BAD_REQUEST,
      );
    }

    return JSON.parse(raw) as OAuthStatePayload;
  }
}
