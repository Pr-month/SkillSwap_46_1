import { AuthModule } from '@/auth/auth.module';
import { OAuthPendingService } from '@/auth/oauth/oauth-pending.service';
import { ConfigurationModule } from '@/module/configuration/configuration.module';
import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';

import { OAuthResolver } from './oauth-resolver.service';
import { OAuthStateService } from './oauth-state.service';
import { OAUTH_PROVIDERS } from './oauth.constants';
import { OAuthController } from './oauth.controller';
import { GoogleOAuthStrategy } from './strategies/google.strategy';
import { YandexOAuthStrategy } from './strategies/yandex.strategy';

@Module({
  imports: [AuthModule, UsersModule, ConfigurationModule],
  controllers: [OAuthController],
  providers: [
    YandexOAuthStrategy,
    GoogleOAuthStrategy,
    OAuthResolver,
    OAuthStateService,
    OAuthPendingService,
    {
      provide: OAUTH_PROVIDERS,
      useFactory: (
        yandex: YandexOAuthStrategy,
        google: GoogleOAuthStrategy,
      ) => [yandex, google],
      inject: [YandexOAuthStrategy, GoogleOAuthStrategy],
    },
  ],
})
export class OAuthModule {}
