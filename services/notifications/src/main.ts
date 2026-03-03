import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import removed - ConfigService not exported from '@nestlancer/config';
import { LoggerService } from '@nestlancer/logger';
import { AppValidationPipe, AllExceptionsFilter, TransformResponseInterceptor, TimeoutInterceptor } from '@nestlancer/common';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    const configService = app.get(ConfigService);
    const logger = app.get(LoggerService);

    app.useLogger(logger);
    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(new AppValidationPipe());
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(
        new TransformResponseInterceptor(),
        new TimeoutInterceptor()
    );

    app.enableCors({
        origin: configService.get<string | string[]>('CORS_ORIGINS') || '*',
        credentials: true,
    });

    const port = process.env.NOTIFICATIONS_SERVICE_PORT || 3011; // Notifications service port
    await app.listen(port);

    logger.log(`Notifications Service running on port ${port}`, 'Bootstrap');
}
bootstrap();
