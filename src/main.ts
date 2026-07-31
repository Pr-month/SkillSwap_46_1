import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configuration, TConfig } from './app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get<TConfig>(configuration.KEY);
  await app.listen(config.port);
}
bootstrap();
