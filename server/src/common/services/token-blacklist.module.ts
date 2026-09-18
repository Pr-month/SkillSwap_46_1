import { Global, Module } from '@nestjs/common';

import { TokenBlacklistService } from './token-blacklist.service';

@Global()
@Module({
  providers: [TokenBlacklistService],
  exports: [TokenBlacklistService],
})
export class TokenBlacklistModule {}
