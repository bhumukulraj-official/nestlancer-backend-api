import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { AppValidationPipe, AllExceptionsFilter, TransformResponseInterceptor, TimeoutInterceptor } from '@nestlancer/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    const configService = app.get(ConfigService);
    const logger = app.get(Logger);

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

    const port = process.env.MEDIA_SERVICE_PORT || 3012; // Media service port
    await app.listen(port);

    logger.log(`Media Service running on port ${port}`, 'Bootstrap');
}
bootstrap();
