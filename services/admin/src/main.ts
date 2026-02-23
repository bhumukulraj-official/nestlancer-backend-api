import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestlancer/config';
import { Logger } from '@nestlancer/logger';
import { TransformResponseInterceptor } from '@nestlancer/common/interceptors/transform-response.interceptor';
import { AllExceptionsFilter } from '@nestlancer/common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from '@nestlancer/common/filters/http-exception.filter';
import { API_PREFIX } from '@nestlancer/common/constants/app.constants';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    // Setup logger
    const logger = app.get(Logger);
    app.useLogger(logger);

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 3014;

    // Global prefix
    app.setGlobalPrefix(API_PREFIX);

    // Global pipes
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    // Global interceptors
    app.useGlobalInterceptors(new TransformResponseInterceptor());

    // Global filters
    app.useGlobalFilters(
        new AllExceptionsFilter(logger),
        new HttpExceptionFilter(logger),
    );

    // Enable CORS
    app.enableCors({
        origin: configService.get<string>('CORS_ORIGINS')?.split(',') || '*',
        methods: configService.get<string>('CORS_METHODS') || 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        credentials: configService.get<boolean>('CORS_CREDENTIALS') ?? true,
    });

    await app.listen(port);
    logger.log(`Admin Service is running on: ${await app.getUrl()}`);
}
bootstrap();
