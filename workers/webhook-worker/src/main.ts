import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from '@nestlancer/logger';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const logger = app.get(LoggerService);

    logger.log('Webhook Worker started');

    process.on('SIGTERM', async () => {
        logger.log('SIGTERM received. Cleaning up...');
        await app.close();
        process.exit(0);
    });
}

bootstrap();
