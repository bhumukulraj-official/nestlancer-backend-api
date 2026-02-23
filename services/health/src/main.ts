import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@nestlancer/logger';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '@nestlancer/common/filters/all-exceptions.filter';
import { TransformResponseInterceptor } from '@nestlancer/common/interceptors/transform-response.interceptor';
import { CorrelationIdMiddleware } from '@nestlancer/tracing/middleware/correlation-id.middleware';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    const logger = app.get(LoggerService);
    app.useLogger(logger);

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3000);
    const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS', '*');

    app.enableCors({
        origin: allowedOrigins.split(','),
        credentials: true,
    });

    app.setGlobalPrefix('api/v1/health');

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
    logger.info(`Health Service is running on port ${port}`, 'Bootstrap');
}
bootstrap();
