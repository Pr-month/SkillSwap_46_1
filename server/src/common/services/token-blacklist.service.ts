import { REDIS_CLIENT } from '@/redis/redis.module';
import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { Redis } from 'ioredis';

@Injectable()
export class TokenBlacklistService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async markAsUsed(token: string, ttlSeconds: number): Promise<void> {
    const tokenHash = this.hashToken(token);
    await this.redis.set(`used_token:${tokenHash}`, '1', 'EX', ttlSeconds);
  }

  async isUsed(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);
    const result = await this.redis.get(`used_token:${tokenHash}`);
    return !!result;
  }
}
