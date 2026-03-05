import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from '@nestlancer/logger';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const logger = app.get(LoggerService);

    app.enableShutdownHooks();

    logger.log('Media Worker is starting...');
    await app.init();
    logger.log('Media Worker is running.');
}

bootstrap().catch((err) => {
    console.error('Failed to start Media Worker', err);
    process.exit(1);
});
