import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.createApplicationContext(AppModule);

    // The consumers are providers that use onModuleInit to start listening

    app.enableShutdownHooks();
    logger.log('CDN Worker is running');
}

bootstrap();
