import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggerService } from '@nestlancer/logger';
import {
  AppValidationPipe,
  AllExceptionsFilter,
  TransformResponseInterceptor,
  TimeoutInterceptor,
} from '@nestlancer/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);

  app.useLogger(logger);
  app.setGlobalPrefix('api/v1');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nestlancer Media Service')
    .setDescription('Media & file uploads API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  app.useGlobalPipes(new AppValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformResponseInterceptor(), new TimeoutInterceptor());

  app.enableCors({
    origin: configService.get<string | string[]>('CORS_ORIGINS') || '*',
    credentials: true,
  });

  const port = process.env.MEDIA_SERVICE_PORT || 3012; // Media service port
  await app.listen(port);

  logger.log(`Media Service running on port ${port}`, 'Bootstrap');
}
bootstrap();
