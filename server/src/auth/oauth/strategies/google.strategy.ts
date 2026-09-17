import { BusinessException } from '@/common/errors/business.exception';
import { exceptionCodes } from '@/common/errors/error-codes';
import { ConfigurationService } from '@/module/configuration/configuration.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { OAuthProfile, OAuthProvider } from '../oauth-provider.interface';

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
}

interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

@Injectable()
export class GoogleOAuthStrategy implements OAuthProvider {
  readonly name = 'google';
  private readonly logger = new Logger(GoogleOAuthStrategy.name);

  private readonly authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly tokenUrl = 'https://oauth2.googleapis.com/token';
  private readonly profileUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';

  constructor(private readonly config: ConfigurationService) {}

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.googleClientId,
      redirect_uri: this.config.googleCallbackUrl,
      scope: 'openid email profile',
      state,
    });
    return `${this.authUrl}?${params.toString()}`;
  }

  async getProfile(code: string): Promise<OAuthProfile> {
    const accessToken = await this.exchangeCode(code);
    const profile = await this.fetchProfile(accessToken);

    if (!profile.email) {
      this.logger.warn(`Google profile ${profile.sub} has no email`);
      throw new BusinessException(
        exceptionCodes.auth.oauthEmailMissing,
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      provider: this.name,
      providerId: profile.sub,
      email: profile.email,
      name: profile.name,
      avatar: profile.picture ?? null,
    };
  }

  private async exchangeCode(code: string): Promise<string> {
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.config.googleClientId,
        client_secret: this.config.googleClientSecret,
        redirect_uri: this.config.googleCallbackUrl,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Google token exchange failed: ${body}`);
      throw new BusinessException(
        exceptionCodes.auth.oauthFailed,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const data = (await response.json()) as GoogleTokenResponse;
    return data.access_token;
  }

  private async fetchProfile(accessToken: string): Promise<GoogleProfile> {
    const response = await fetch(this.profileUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new BusinessException(
        exceptionCodes.auth.oauthFailed,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return (await response.json()) as GoogleProfile;
  }
}
