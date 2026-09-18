import { BusinessException } from '@/common/errors/business.exception';
import { exceptionCodes } from '@/common/errors/error-codes';
import { getBaseUrl } from '@/common/utils/get-base-url';
import { REDIS_CLIENT } from '@/redis/redis.module';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

import { OAuthStateService } from './oauth-state.service';

jest.mock('@/common/utils/get-base-url');

const mockedGetBaseUrl = getBaseUrl as jest.MockedFunction<typeof getBaseUrl>;

describe('OAuthStateService', () => {
  let service: OAuthStateService;

  const mockRedis = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };

  const mockRequest = {
    get: jest.fn(),
    protocol: 'http',
  } as unknown as Request;

  const allowedOrigins = ['http://localhost:5173', 'https://skillswap.com'];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthStateService,
        {
          provide: REDIS_CLIENT,
          useValue: mockRedis,
        },
      ],
    }).compile();

    service = module.get<OAuthStateService>(OAuthStateService);

    jest.clearAllMocks();
    mockedGetBaseUrl.mockReturnValue('http://localhost:5173');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    it('should store payload in Redis with TTL and return state', async () => {
      mockRedis.set.mockResolvedValue('OK');

      const state = await service.generate(
        'google',
        allowedOrigins,
        mockRequest,
      );

      // state — 64 hex-символа (32 байта)
      expect(state).toMatch(/^[a-f0-9]{64}$/);

      expect(mockedGetBaseUrl).toHaveBeenCalledWith(
        allowedOrigins,
        mockRequest,
      );

      expect(mockRedis.set).toHaveBeenCalledWith(
        `oauth:state:${state}`,
        JSON.stringify({
          provider: 'google',
          returnUrl: 'http://localhost:5173',
        }),
        'EX',
        300,
      );
    });

    it('should generate unique states on each call', async () => {
      mockRedis.set.mockResolvedValue('OK');

      const state1 = await service.generate(
        'google',
        allowedOrigins,
        mockRequest,
      );
      const state2 = await service.generate(
        'google',
        allowedOrigins,
        mockRequest,
      );

      expect(state1).not.toEqual(state2);
    });

    it('should use returnUrl from getBaseUrl', async () => {
      mockRedis.set.mockResolvedValue('OK');
      mockedGetBaseUrl.mockReturnValue('https://skillswap.com');

      const state = await service.generate(
        'yandex',
        allowedOrigins,
        mockRequest,
      );

      expect(mockRedis.set).toHaveBeenCalledWith(
        `oauth:state:${state}`,
        JSON.stringify({
          provider: 'yandex',
          returnUrl: 'https://skillswap.com',
        }),
        'EX',
        300,
      );
    });
  });

  describe('consume', () => {
    const state = 'a'.repeat(64);
    const payload = {
      provider: 'google',
      returnUrl: 'http://localhost:5173',
    };

    it('should return payload and delete key from Redis', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(payload));
      mockRedis.del.mockResolvedValue(1);

      const result = await service.consume(state);

      expect(result).toEqual(payload);
      expect(mockRedis.get).toHaveBeenCalledWith(`oauth:state:${state}`);
      expect(mockRedis.del).toHaveBeenCalledWith(`oauth:state:${state}`);
    });

    it('should throw oauthStateInvalid if state is missing', async () => {
      mockRedis.get.mockResolvedValue(null);

      await expect(service.consume(state)).rejects.toMatchObject({
        code: exceptionCodes.auth.oauthStateInvalid,
      });

      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should throw oauthStateInvalid if payload is corrupted', async () => {
      mockRedis.get.mockResolvedValue('not-a-json');

      await expect(service.consume(state)).rejects.toThrow(SyntaxError);
    });

    it('should not throw if state was already consumed (deleted)', async () => {
      mockRedis.get.mockResolvedValue(null);

      await expect(service.consume(state)).rejects.toThrow(BusinessException);
    });
  });

  describe('peek', () => {
    const state = 'b'.repeat(64);
    const payload = {
      provider: 'yandex',
      returnUrl: 'https://skillswap.com',
    };

    it('should return payload without deleting key', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(payload));

      const result = await service.peek(state);

      expect(result).toEqual(payload);
      expect(mockRedis.get).toHaveBeenCalledWith(`oauth:state:${state}`);
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should throw oauthStateInvalid if state is missing', async () => {
      mockRedis.get.mockResolvedValue(null);

      await expect(service.peek(state)).rejects.toMatchObject({
        code: exceptionCodes.auth.oauthStateInvalid,
      });
    });

    it('should allow multiple peeks for the same state', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(payload));

      await service.peek(state);
      await service.peek(state);

      expect(mockRedis.get).toHaveBeenCalledTimes(2);
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe('consume after peek', () => {
    it('should allow peek then consume (state not burned by peek)', async () => {
      const state = 'c'.repeat(64);
      const payload = {
        provider: 'google',
        returnUrl: 'http://localhost:5173',
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(payload));
      mockRedis.del.mockResolvedValue(1);

      const peeked = await service.peek(state);
      expect(peeked).toEqual(payload);
      expect(mockRedis.del).not.toHaveBeenCalled();

      const consumed = await service.consume(state);
      expect(consumed).toEqual(payload);
      expect(mockRedis.del).toHaveBeenCalledWith(`oauth:state:${state}`);
    });
  });
});
