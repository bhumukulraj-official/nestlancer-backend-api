import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@nestlancer/logger';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter, TransformResponseInterceptor } from '@nestlancer/common';
import { CorrelationIdMiddleware } from '@nestlancer/tracing';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    const logger = app.get(LoggerService);
    app.useLogger(logger);

    const configService = app.get(ConfigService);
    const port = configService.get<number>('QUOTES_SERVICE_PORT', 3007);
    const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS', '*');

    app.enableCors({
        origin: allowedOrigins.split(','),
        credentials: true,
        exposedHeaders: ['Content-Disposition'], // Needed for PDF downloads
    });

    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    app.useGlobalInterceptors(new TransformResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter(logger));
    app.use(new CorrelationIdMiddleware().use);

    app.enableShutdownHooks();

    await app.listen(port);
    logger.info(`Quotes Service is running on port ${port}`, 'Bootstrap');
}
bootstrap();
