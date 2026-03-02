import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestlancer/config';
import { Logger } from '@nestlancer/logger';
import { ValidationPipe } from '@nestlancer/common/pipes/validation.pipe';
import { AllExceptionsFilter } from '@nestlancer/common/filters/all-exceptions.filter';
import { TransformResponseInterceptor } from '@nestlancer/common/interceptors/transform-response.interceptor';
import { TimeoutInterceptor } from '@nestlancer/common/interceptors/timeout.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    const configService = app.get(ConfigService);
    const logger = app.get(Logger);

    app.useLogger(logger);
    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new AllExceptionsFilter(logger));
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
