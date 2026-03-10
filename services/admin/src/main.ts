import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggerService } from '@nestlancer/logger';
import { AppModule } from './app.module';
// import removed - ConfigService not exported from '@nestlancer/config';
// import removed - Logger not exported from '@nestlancer/logger';
import {
  TransformResponseInterceptor,
  AllExceptionsFilter,
  HttpExceptionFilter,
  API_PREFIX,
} from '@nestlancer/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Setup logger
  const logger = app.get(LoggerService);
  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('ADMIN_SERVICE_PORT') || 3005;

  // Global prefix
  app.setGlobalPrefix(API_PREFIX);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nestlancer Admin Service')
    .setDescription('Administration API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));

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
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

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
