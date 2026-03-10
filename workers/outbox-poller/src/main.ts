import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.createApplicationContext(AppModule);

  app.enableShutdownHooks();
  logger.log('Outbox Poller Worker is running');
}

bootstrap();
