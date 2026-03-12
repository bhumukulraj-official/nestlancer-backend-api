process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/testdb';
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || 'test-secret-32-chars-minimum!!';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter, TransformResponseInterceptor } from '@nestlancer/common';
import { AppModule } from '../src/app.module';

const GLOBAL_PREFIX = 'api';

let app: INestApplication;

export async function setupApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
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
