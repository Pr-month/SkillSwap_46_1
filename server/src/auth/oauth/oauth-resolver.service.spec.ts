import { exceptionCodes } from '@/common/errors/error-codes';
import { Test, TestingModule } from '@nestjs/testing';

import { OAuthProvider } from './oauth-provider.interface';
import { OAuthResolver } from './oauth-resolver.service';
import { OAUTH_PROVIDERS } from './oauth.constants';

describe('OAuthResolver', () => {
  const createMockProvider = (name: string): OAuthProvider => ({
    name,
    getAuthUrl: jest.fn().mockReturnValue(`https://${name}.com/auth`),
    getProfile: jest.fn(),
  });

  const mockGoogle = createMockProvider('google');
  const mockYandex = createMockProvider('yandex');

  const buildModule = async (providers: OAuthProvider[]) => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthResolver,
        {
          provide: OAUTH_PROVIDERS,
          useValue: providers,
        },
      ],
    }).compile();

    return module.get<OAuthResolver>(OAuthResolver);
  };

  it('should be defined', async () => {
    const resolver = await buildModule([mockGoogle, mockYandex]);
    expect(resolver).toBeDefined();
  });

  describe('get', () => {
    let resolver: OAuthResolver;

    beforeEach(async () => {
      resolver = await buildModule([mockGoogle, mockYandex]);
    });

    it('should return the google provider by name', () => {
      const provider = resolver.get('google');

      expect(provider).toBe(mockGoogle);
      expect(provider.name).toBe('google');
    });

    it('should return the yandex provider by name', () => {
      const provider = resolver.get('yandex');

      expect(provider).toBe(mockYandex);
      expect(provider.name).toBe('yandex');
    });

    it('should throw unknownOAuthProvider for unknown name', () => {
      expect(() => resolver.get('github')).toThrow(
        expect.objectContaining({
          code: exceptionCodes.auth.unknownOAuthProvider,
        }),
      );
    });

    it('should be case-sensitive', () => {
      expect(() => resolver.get('Google')).toThrow(
        expect.objectContaining({
          code: exceptionCodes.auth.unknownOAuthProvider,
        }),
      );
    });

    it('should return the same instance on repeated calls', () => {
      const first = resolver.get('google');
      const second = resolver.get('google');

      expect(first).toBe(second);
    });
  });

  describe('empty providers list', () => {
    let resolver: OAuthResolver;

    beforeEach(async () => {
      resolver = await buildModule([]);
    });

    it('should throw unknownOAuthProvider for any name', () => {
      expect(() => resolver.get('google')).toThrow(
        expect.objectContaining({
          code: exceptionCodes.auth.unknownOAuthProvider,
        }),
      );
    });
  });

  describe('duplicate names', () => {
    it('should keep the last provider with the same name', async () => {
      const firstGoogle = createMockProvider('google');
      const secondGoogle = createMockProvider('google');

      const resolver = await buildModule([firstGoogle, secondGoogle]);

      expect(resolver.get('google')).toBe(secondGoogle);
    });
  });
});
