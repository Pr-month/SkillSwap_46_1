import { Module } from '@nestjs/common';

import { OAuthPendingService } from './oauth-pending.service';

@Module({
  providers: [OAuthPendingService],
  exports: [OAuthPendingService],
})
export class OAuthPendingModule {}
