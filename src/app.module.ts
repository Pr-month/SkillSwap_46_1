import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigurationModule } from './module/configuration/configuration.module';
import { validate } from './module/configuration/validation/env.validation';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigurationModule,
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
