import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { csrfMiddleware } from './common/middleware/csrf.middleware';
import { ConfigurationService } from './module/configuration/configuration.service';

import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigurationService);
  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.set('trust proxy', 1);

  app.useGlobalFilters(new AllExceptionsFilter());
  app.use(cookieParser());

  app.enableCors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      let hostname: string;
      try {
        hostname = new URL(origin).hostname;
      } catch {
        callback(null, false);
        return;
      }

      const allowedOrigins = configService.corsOrigins;
      const isAllowed =
        allowedOrigins.includes(origin) || allowedOrigins.includes(hostname);

      callback(null, isAllowed);
    },
  });

  app.use(csrfMiddleware);
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new ResponseInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SkillSwap API')
    .setDescription('API для платформы обмена навыками SkillSwap')
    .setVersion('1.0')
    .addCookieAuth('accessToken', undefined, 'accessToken')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, documentFactory);

  app.setGlobalPrefix('api');

  const port = configService.port || 8080;

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
