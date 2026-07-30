import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './app.config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env', 
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET, // временно берём напрямую из env
      signOptions: {
         // @ts-expect-error: process.env возвращает string, а ms ожидает строгий Strin
        expiresIn: process.env.JWT_EXPIRES_IN || '1d', // аналогично временное решение
      },
    }),
    UsersModule, 
    AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
