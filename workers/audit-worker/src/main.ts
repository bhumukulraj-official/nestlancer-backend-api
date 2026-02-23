import { NestFactory } from '@nestjs/core';
import { AuditModule } from './app.module';
import { LoggerService } from '@nestlancer/logger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AuditModule);
    const logger = app.get(LoggerService);
    const configService = app.get(ConfigService);

    const workerName = 'Audit Worker';

    app.enableShutdownHooks();

    logger.log(`${workerName} is starting...`);

    // Wait for the application to be ready
    await app.init();

    logger.log(`${workerName} is running and connected to RabbitMQ.`);
}

bootstrap().catch((err) => {
    console.error('Failed to start Audit Worker', err);
    process.exit(1);
});
