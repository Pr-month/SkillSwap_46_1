import { ConfigurationModule } from '@/module/configuration/configuration.module';
import { SkillsModule } from '@/skills/skills.module';
import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [UsersModule, SkillsModule, PassportModule, ConfigurationModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, LocalStrategy],
})
export class AuthModule {}
