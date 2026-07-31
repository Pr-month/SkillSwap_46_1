import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigurationModule } from './module/configuration/configuration.module';
import { validate } from './module/configuration/validation/env.validation';
import { UsersModule } from './users/users.module';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { jwtConfigFactory } from './config/jwt.config';
import { ConfigurationService } from './module/configuration/configuration.service';


@Module({
  imports: [
    ConfigurationModule,
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
    }),
     JwtModule.registerAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (configService: ConfigurationService) => {
        const jwtConfig = jwtConfigFactory(configService); 
        
        return {
          global: true,
          secret: jwtConfig.accessSecret,
          signOptions: {
            expiresIn: jwtConfig.accessExpiresIn as JwtSignOptions['expiresIn'],
          },
        };
      },
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
