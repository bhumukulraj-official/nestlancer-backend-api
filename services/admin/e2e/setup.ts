process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/testdb';
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || 'test-secret-32-chars-minimum!!';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { API_PREFIX } from '@nestlancer/common';
import { ValidationPipe } from '@nestjs/common';
import {
  AllExceptionsFilter,
  HttpExceptionFilter,
  TransformResponseInterceptor,
} from '@nestlancer/common';
import { AppModule } from '../src/app.module';

const GLOBAL_PREFIX = API_PREFIX;

let app: INestApplication;

export async function setupApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
  await app.init();
  await app.listen(0);
  return app;
}

export async function teardownApp(): Promise<void> {
  await app?.close();
}

export function getAppUrl(): string {
  const server = app.getHttpServer();
  const address = server.address() as { port: number };
  return `http://localhost:${address.port}`;
}

export function getGlobalPrefix(): string {
  return GLOBAL_PREFIX;
}
