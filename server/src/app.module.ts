import { CitiesModule } from '@/cities/cities.module';
import { HttpLoggerMiddleware } from '@/common/middleware/http-logger.middleware';
import { MailModule } from '@/mail/mail.module';
import { RedisModule } from '@/redis/redis.module';
import { S3Module } from '@/s3/s3.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StringValue } from 'ms';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { SubcategoriesModule } from './categories/subcategories/subcategories.module';
import { dbConfig } from './config/db.config';
import { jwtConfigFactory } from './config/jwt.config';
import { FavoritesModule } from './favorites/favorites.module';
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
    ThrottlerModule.forRootAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (configService: ConfigurationService) => ({
        throttlers: [
          {
            ttl: configService.throttleTtl * 1000,
            limit: configService.throttleLimit,
          },
        ],
        skipIf: () => process.env.NODE_ENV === 'test',
      }),
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    SubcategoriesModule,
    FavoritesModule,
    SkillsModule,
    RequestsModule,
    CitiesModule,
    GatewayModule,
    S3Module,
    MailModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
