import { BusinessException } from '@/common/errors/business.exception';
import { exceptionCodes } from '@/common/errors/error-codes';
import { REDIS_CLIENT } from '@/redis/redis.module';
import { Inject, Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Redis } from 'ioredis';

import { OAuthProfile } from './oauth-provider.interface';

@Injectable()
export class OAuthPendingService {
  private readonly ttl = 1800;

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async create(profile: OAuthProfile): Promise<string> {
    const pendingId = randomBytes(32).toString('hex');

    await this.redis.set(
      `oauth:pending:${pendingId}`,
      JSON.stringify(profile),
      'EX',
      this.ttl,
    );

    return pendingId;
  }

  async peek(pendingId: string): Promise<OAuthProfile> {
    const raw = await this.redis.get(`oauth:pending:${pendingId}`);

    if (!raw) {
      throw new BusinessException(
        exceptionCodes.auth.oauthPendingExpired,
        HttpStatus.BAD_REQUEST,
      );
    }

    return JSON.parse(raw) as OAuthProfile;
  }

  async consume(pendingId: string): Promise<OAuthProfile> {
    const key = `oauth:pending:${pendingId}`;
    const raw = await this.redis.get(key);

    if (!raw) {
      throw new BusinessException(
        exceptionCodes.auth.oauthPendingExpired,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.redis.del(key);

    return JSON.parse(raw) as OAuthProfile;
  }
}
