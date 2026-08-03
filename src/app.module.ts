import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { SubcategoriesModule } from './categories/subcategories/subcategories.module';
import { dbConfig } from './config/db.config';
import { jwtConfigFactory } from './config/jwt.config';
import { ConfigurationModule } from './module/configuration/configuration.module';
import { ConfigurationService } from './module/configuration/configuration.service';
import { validate } from './module/configuration/validation/env.validation';
import { UsersModule } from './users/users.module';

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
    TypeOrmModule.forRootAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: dbConfig,
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    SubcategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
