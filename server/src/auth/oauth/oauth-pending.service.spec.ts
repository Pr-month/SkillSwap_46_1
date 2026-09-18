import { exceptionCodes } from '@/common/errors/error-codes';
import { REDIS_CLIENT } from '@/redis/redis.module';
import { Test, TestingModule } from '@nestjs/testing';

import { OAuthPendingService } from './oauth-pending.service';
import { OAuthProfile } from './oauth-provider.interface';

describe('OAuthPendingService', () => {
  let service: OAuthPendingService;

  const mockRedis = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };

  const mockProfile: OAuthProfile = {
    provider: 'google',
    providerId: 'google-user-123',
    email: 'test@example.com',
    name: 'Иван Петров',
    avatar: 'https://example.com/avatar.jpg',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthPendingService,
        {
          provide: REDIS_CLIENT,
          useValue: mockRedis,
        },
      ],
    }).compile();

    service = module.get<OAuthPendingService>(OAuthPendingService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should generate pendingId, store profile in Redis with TTL 1800 and return id', async () => {
      mockRedis.set.mockResolvedValue('OK');

      const pendingId = await service.create(mockProfile);

      // pendingId — 64 hex-символа (32 байта)
      expect(pendingId).toMatch(/^[a-f0-9]{64}$/);

      expect(mockRedis.set).toHaveBeenCalledWith(
        `oauth:pending:${pendingId}`,
        JSON.stringify(mockProfile),
        'EX',
        1800,
      );
    });

    it('should generate unique pendingIds on each call', async () => {
      mockRedis.set.mockResolvedValue('OK');

      const id1 = await service.create(mockProfile);
      const id2 = await service.create(mockProfile);

      expect(id1).not.toEqual(id2);
    });

    it('should store profile without avatar (null)', async () => {
      mockRedis.set.mockResolvedValue('OK');

      const profileWithoutAvatar: OAuthProfile = {
        ...mockProfile,
        avatar: null,
      };

      const pendingId = await service.create(profileWithoutAvatar);

      expect(mockRedis.set).toHaveBeenCalledWith(
        `oauth:pending:${pendingId}`,
        JSON.stringify(profileWithoutAvatar),
        'EX',
        1800,
      );
    });
  });

  describe('peek', () => {
    const pendingId = 'a'.repeat(64);

    it('should return profile without deleting key', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(mockProfile));

      const result = await service.peek(pendingId);

      expect(result).toEqual(mockProfile);
      expect(mockRedis.get).toHaveBeenCalledWith(`oauth:pending:${pendingId}`);
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should throw oauthPendingExpired if pendingId is missing', async () => {
      mockRedis.get.mockResolvedValue(null);

      await expect(service.peek(pendingId)).rejects.toMatchObject({
        code: exceptionCodes.auth.oauthPendingExpired,
      });

      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should allow multiple peeks for the same pendingId', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(mockProfile));

      await service.peek(pendingId);
      await service.peek(pendingId);

      expect(mockRedis.get).toHaveBeenCalledTimes(2);
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should throw SyntaxError on corrupted JSON', async () => {
      mockRedis.get.mockResolvedValue('not-a-json');

      await expect(service.peek(pendingId)).rejects.toThrow(SyntaxError);
    });
  });

  describe('consume', () => {
    const pendingId = 'b'.repeat(64);

    it('should return profile and delete key from Redis', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(mockProfile));
      mockRedis.del.mockResolvedValue(1);

      const result = await service.consume(pendingId);

      expect(result).toEqual(mockProfile);
      expect(mockRedis.get).toHaveBeenCalledWith(`oauth:pending:${pendingId}`);
      expect(mockRedis.del).toHaveBeenCalledWith(`oauth:pending:${pendingId}`);
    });

    it('should throw oauthPendingExpired if pendingId is missing', async () => {
      mockRedis.get.mockResolvedValue(null);

      await expect(service.consume(pendingId)).rejects.toMatchObject({
        code: exceptionCodes.auth.oauthPendingExpired,
      });

      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should not be consumable twice', async () => {
      mockRedis.get
        .mockResolvedValueOnce(JSON.stringify(mockProfile))
        .mockResolvedValueOnce(null);
      mockRedis.del.mockResolvedValue(1);

      const first = await service.consume(pendingId);
      expect(first).toEqual(mockProfile);

      await expect(service.consume(pendingId)).rejects.toMatchObject({
        code: exceptionCodes.auth.oauthPendingExpired,
      });
    });

    it('should throw SyntaxError on corrupted JSON', async () => {
      mockRedis.get.mockResolvedValue('not-a-json');

      await expect(service.consume(pendingId)).rejects.toThrow(SyntaxError);
    });
  });

  describe('peek then consume', () => {
    const pendingId = 'c'.repeat(64);

    it('should allow peek then consume (peek does not burn pendingId)', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(mockProfile));
      mockRedis.del.mockResolvedValue(1);

      const peeked = await service.peek(pendingId);
      expect(peeked).toEqual(mockProfile);
      expect(mockRedis.del).not.toHaveBeenCalled();

      const consumed = await service.consume(pendingId);
      expect(consumed).toEqual(mockProfile);
      expect(mockRedis.del).toHaveBeenCalledWith(`oauth:pending:${pendingId}`);
    });
  });
});
