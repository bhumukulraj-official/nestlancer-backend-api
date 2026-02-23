import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppValidationPipe, AllExceptionsFilter, TransformResponseInterceptor, LoggingInterceptor, TimeoutInterceptor, API_PREFIX, API_VERSION, DEFAULT_GATEWAY_PORT, MAX_PAYLOAD_SIZE } from '@nestlancer/common';
import { getCorsConfig } from '@nestlancer/middleware';
import helmet from 'helmet';
import { getHelmetConfig } from '@nestlancer/middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Security
  app.use(helmet(getHelmetConfig()));
  app.enableCors(getCorsConfig(process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000']));

  // Global prefix
  app.setGlobalPrefix(`${API_PREFIX}/${API_VERSION}`);

  // Global pipes, filters, interceptors
  app.useGlobalPipes(new AppValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformResponseInterceptor(), new TimeoutInterceptor());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Nestlancer API')
    .setDescription('Nestlancer Backend API – Professional freelance platform')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addTag('auth', 'Authentication & authorization')
    .addTag('users', 'User management')
    .addTag('requests', 'Project requests')
    .addTag('quotes', 'Quotes & proposals')
    .addTag('projects', 'Project management')
    .addTag('payments', 'Payment processing')
    .addTag('messages', 'Project messaging')
    .addTag('notifications', 'User notifications')
    .addTag('media', 'Media & file uploads')
    .addTag('portfolio', 'Portfolio showcase')
    .addTag('blog', 'Blog management')
    .addTag('contact', 'Contact form')
    .addTag('admin', 'Administration')
    .addTag('health', 'Health checks')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || DEFAULT_GATEWAY_PORT;
  await app.listen(port);
  console.log(`🚀 Nestlancer API Gateway running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
