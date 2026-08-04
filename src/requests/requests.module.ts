import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Skill } from '../skills/entities/skills.entity';
import { User } from '../users/entities/user.entity';
import { Request } from './entities/request.entity';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

@Module({
  imports: [TypeOrmModule.forFeature([Request, Skill, User])],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
