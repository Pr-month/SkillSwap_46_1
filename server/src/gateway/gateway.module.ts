import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ConfigurationModule } from '../module/configuration/configuration.module';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [JwtModule, ConfigurationModule],
  providers: [NotificationsGateway, WsJwtGuard],
  exports: [NotificationsGateway],
})
export class GatewayModule {}
