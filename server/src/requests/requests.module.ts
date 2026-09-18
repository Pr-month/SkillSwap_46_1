import { GatewayModule } from '@/gateway/gateway.module';
import { EmailConfirmedGuard } from '@/mail/guards/email-confirmed.guard';
import { Skill } from '@/skills/entities/skills.entity';
import { User } from '@/users/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Request } from './entities/request.entity';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

@Module({
  imports: [TypeOrmModule.forFeature([Request, Skill, User]), GatewayModule],
  controllers: [RequestsController],
  providers: [RequestsService, EmailConfirmedGuard],
})
export class RequestsModule {}
