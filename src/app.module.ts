import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StringValue } from 'ms';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { SubcategoriesModule } from './categories/subcategories/subcategories.module';
import { dbConfig } from './config/db.config';
import { jwtConfigFactory } from './config/jwt.config';
import { GatewayModule } from './gateway/gateway.module';
import { ConfigurationModule } from './module/configuration/configuration.module';
import { ConfigurationService } from './module/configuration/configuration.service';
import { validate } from './module/configuration/validation/env.validation';
import { RequestsModule } from './requests/requests.module';
import { SkillsModule } from './skills/skills.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigurationModule,
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (configService: ConfigurationService) => {
        const jwtConfig = jwtConfigFactory(configService);

        return {
          // global: true,
          secret: jwtConfig.accessSecret,
          signOptions: {
            expiresIn: jwtConfig.accessExpiresIn as StringValue,
          },
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: dbConfig,
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    SubcategoriesModule,
    SkillsModule,
    RequestsModule,
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
