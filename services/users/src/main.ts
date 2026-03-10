import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@nestlancer/logger';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter, TransformResponseInterceptor } from '@nestlancer/common';
import { CorrelationIdMiddleware } from '@nestlancer/tracing';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    const logger = app.get(LoggerService);
    app.useLogger(logger);

    const configService = app.get(ConfigService);
    const port = configService.get<number>('USERS_SERVICE_PORT', 3002);
    const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS', '*');

    app.enableCors({
        origin: allowedOrigins.split(','),
        credentials: true,
    });

    app.setGlobalPrefix('api/v1');

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Nestlancer Users Service')
        .setDescription('User management API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    app.useGlobalInterceptors(new TransformResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());
    app.use(new CorrelationIdMiddleware().use);

    app.enableShutdownHooks();

    await app.listen(port);
    logger.log(`Users Service is running on port ${port}`, 'Bootstrap');
}
bootstrap();
