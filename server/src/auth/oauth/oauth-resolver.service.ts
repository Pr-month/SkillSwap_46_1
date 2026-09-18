import { BusinessException } from '@/common/errors/business.exception';
import { exceptionCodes } from '@/common/errors/error-codes';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';

import { OAuthProvider } from './oauth-provider.interface';
import { OAUTH_PROVIDERS } from './oauth.constants';

@Injectable()
export class OAuthResolver {
  private readonly providers = new Map<string, OAuthProvider>();

  constructor(@Inject(OAUTH_PROVIDERS) providers: OAuthProvider[]) {
    for (const provider of providers) {
      this.providers.set(provider.name, provider);
    }
  }

  get(name: string): OAuthProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new BusinessException(
        exceptionCodes.auth.unknownOAuthProvider,
        HttpStatus.BAD_REQUEST,
      );
    }
    return provider;
  }
}
