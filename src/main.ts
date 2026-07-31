import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ConfigurationService } from './module/configuration/configuration.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigurationService);

  const port = configService.port || 8080;

  app.listen(port);
}
bootstrap();
