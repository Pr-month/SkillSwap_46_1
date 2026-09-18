import { BusinessException } from '@/common/errors/business.exception';
import { exceptionCodes } from '@/common/errors/error-codes';
import { ConfigurationService } from '@/module/configuration/configuration.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { OAuthProfile, OAuthProvider } from '../oauth-provider.interface';

interface YandexTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface YandexProfile {
  id: string;
  login: string;
  real_name?: string;
  display_name?: string;
  default_email?: string;
  emails?: string[];
  default_avatar_id?: string;
}

@Injectable()
export class YandexOAuthStrategy implements OAuthProvider {
  readonly name = 'yandex';
  private readonly logger = new Logger(YandexOAuthStrategy.name);

  private readonly authUrl = 'https://oauth.yandex.ru/authorize';
  private readonly tokenUrl = 'https://oauth.yandex.ru/token';
  private readonly profileUrl = 'https://login.yandex.ru/info?format=json';

  constructor(private readonly config: ConfigurationService) {}

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.yandexClientId,
      redirect_uri: this.config.yandexCallbackUrl,
      scope: 'login:email login:info',
      state,
    });
    return `${this.authUrl}?${params.toString()}`;
  }

  async getProfile(code: string): Promise<OAuthProfile> {
    const accessToken = await this.exchangeCode(code);
    const profile = await this.fetchProfile(accessToken);

    const email = profile.default_email ?? profile.emails?.[0];

    if (!email) {
      this.logger.warn(
        `Yandex profile ${profile.id} has no email (scope login:email?)`,
      );
      throw new BusinessException(
        exceptionCodes.auth.oauthEmailMissing,
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      provider: this.name,
      providerId: profile.id,
      email,
      name: profile.real_name ?? profile.display_name ?? profile.login,
      avatar: profile.default_avatar_id
        ? `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`
        : null,
    };
  }

  private async exchangeCode(code: string): Promise<string> {
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.config.yandexClientId,
        client_secret: this.config.yandexClientSecret,
        redirect_uri: this.config.yandexCallbackUrl,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Yandex token exchange failed: ${body}`);
      throw new BusinessException(
        exceptionCodes.auth.oauthFailed,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const data = (await response.json()) as YandexTokenResponse;
    return data.access_token;
  }

  private async fetchProfile(accessToken: string): Promise<YandexProfile> {
    const response = await fetch(this.profileUrl, {
      headers: { Authorization: `OAuth ${accessToken}` },
    });

    if (!response.ok) {
      throw new BusinessException(
        exceptionCodes.auth.oauthFailed,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return (await response.json()) as YandexProfile;
  }
}
