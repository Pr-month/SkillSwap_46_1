import { Module } from '@nestjs/common';

import { ConfigurationModule } from '../module/configuration/configuration.module';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [ConfigurationModule],
  providers: [NotificationsGateway, WsJwtGuard],
  exports: [NotificationsGateway],
})
export class GatewayModule {}
