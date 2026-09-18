export type OAuthProviderName = 'google' | 'yandex';

export interface OAuthProfile {
  email: string;
  name: string;
  avatar?: string | null;
  providerId: string;
  provider: OAuthProviderName;
}

export interface OAuthProvider {
  readonly name: string;
  getAuthUrl(state: string): string;
  getProfile(code: string): Promise<OAuthProfile>;
}
