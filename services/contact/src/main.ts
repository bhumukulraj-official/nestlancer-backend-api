import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestlancer/config';
import { LoggerService } from '@nestlancer/logger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bufferLogs: true,
    });

    const logger = app.get(LoggerService);
    app.useLogger(logger);

    app.enableCors();

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 3013;
    const apiPrefix = configService.get<string>('API_PREFIX') || '/api/v1';

    app.setGlobalPrefix(apiPrefix);

    await app.listen(port);
    logger.log(`Contact Service is running on: ${await app.getUrl()}`);
}
bootstrap();
