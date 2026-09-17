import { REDIS_CLIENT } from '@/redis/redis.module';
import { Test, TestingModule } from '@nestjs/testing';
import { createHash } from 'crypto';

import { TokenBlacklistService } from './token-blacklist.service';

describe('TokenBlacklistService', () => {
  let service: TokenBlacklistService;

  const mockRedis = {
    set: jest.fn(),
    get: jest.fn(),
  };

  const token = 'some-jwt-token';
  const ttlSeconds = 3600;

  const expectedHash = createHash('sha256').update(token).digest('hex');
  const expectedKey = `used_token:${expectedHash}`;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenBlacklistService,
        {
          provide: REDIS_CLIENT,
          useValue: mockRedis,
        },
      ],
    }).compile();

    service = module.get<TokenBlacklistService>(TokenBlacklistService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('markAsUsed', () => {
    it('should store hashed token in Redis with TTL', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await service.markAsUsed(token, ttlSeconds);

      expect(mockRedis.set).toHaveBeenCalledWith(
        expectedKey,
        '1',
        'EX',
        ttlSeconds,
      );
    });

    it('should hash token with sha256, not store it in plain text', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await service.markAsUsed(token, ttlSeconds);

      const [key] = mockRedis.set.mock.calls[0];
      expect(key).not.toContain(token);
      expect(key).toBe(expectedKey);
    });

    it('should produce different keys for different tokens', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await service.markAsUsed('token-a', ttlSeconds);
      await service.markAsUsed('token-b', ttlSeconds);

      const [firstKey] = mockRedis.set.mock.calls[0];
      const [secondKey] = mockRedis.set.mock.calls[1];

      expect(firstKey).not.toBe(secondKey);
    });

    it('should produce the same key for the same token', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await service.markAsUsed(token, ttlSeconds);
      await service.markAsUsed(token, ttlSeconds);

      const [firstKey] = mockRedis.set.mock.calls[0];
      const [secondKey] = mockRedis.set.mock.calls[1];

      expect(firstKey).toBe(secondKey);
    });
  });

  describe('isUsed', () => {
    it('should return true when token is in blacklist', async () => {
      mockRedis.get.mockResolvedValue('1');

      const result = await service.isUsed(token);

      expect(result).toBe(true);
      expect(mockRedis.get).toHaveBeenCalledWith(expectedKey);
    });

    it('should return false when token is not in blacklist', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await service.isUsed(token);

      expect(result).toBe(false);
      expect(mockRedis.get).toHaveBeenCalledWith(expectedKey);
    });

    it('should use the same key format as markAsUsed', async () => {
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue(null);

      await service.markAsUsed(token, ttlSeconds);
      await service.isUsed(token);

      const [setKey] = mockRedis.set.mock.calls[0];
      const [getKey] = mockRedis.get.mock.calls[0];

      expect(setKey).toBe(getKey);
    });

    it('should return false for empty string in Redis', async () => {
      mockRedis.get.mockResolvedValue('');

      const result = await service.isUsed(token);

      expect(result).toBe(false);
    });
  });

  describe('markAsUsed + isUsed flow', () => {
    it('should mark token as used and then detect it', async () => {
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue('1');

      await service.markAsUsed(token, ttlSeconds);
      const result = await service.isUsed(token);

      expect(result).toBe(true);
    });

    it('should not detect a different token as used', async () => {
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.get.mockImplementation(async (key: string) => {
        return key === expectedKey ? '1' : null;
      });

      await service.markAsUsed(token, ttlSeconds);
      const result = await service.isUsed('another-token');

      expect(result).toBe(false);
    });
  });
});
