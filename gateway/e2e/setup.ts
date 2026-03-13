/**
 * E2E setup: bootstraps the Gateway app and exposes URL for HTTP calls.
 * Must be imported first so env is set before AppModule loads.
 */
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');

process.env.NODE_ENV = process.env.NODE_ENV || 'e2e';
dotenv.config({
  path: path.resolve(__dirname, '../../.env.e2e'),
});

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import {
  AppValidationPipe,
  AllExceptionsFilter,
  TransformResponseInterceptor,
  API_PREFIX,
  API_VERSION,
} from '@nestlancer/common';
import { AppModule } from '../src/app.module';

let app: INestApplication;

function mockHttpService() {
  return {
    request: jest.fn().mockImplementation((config: { url?: string; headers?: Record<string, string> }) => {
      const auth = config.headers?.Authorization;
      const isProtected = config.url?.includes('/users/') || config.url?.includes('/admin/') || config.url?.includes('/projects');
      if (isProtected && !auth) {
        return throwError(() => Object.assign(new Error('Unauthorized'), { response: { status: 401, data: { message: 'Unauthorized' } } }));
      }
      if (config.url?.includes('/health') || config.url?.includes('/auth/')) {
        return of({ data: { status: 'ok' }, status: 200, headers: {} });
      }
      return of({ data: {}, status: 200, headers: {} });
    }),
    get: jest.fn().mockReturnValue(of({ data: { status: 'ok' }, status: 200, headers: {} })),
  };
}

export async function setupApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(HttpService)
    .useValue(mockHttpService())
    .compile();

  app = moduleRef.createNestApplication();
  app.setGlobalPrefix(`${API_PREFIX}/${API_VERSION}`);
  app.useGlobalPipes(new AppValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformResponseInterceptor());
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

export function getBasePath(): string {
  return `/${API_PREFIX}/${API_VERSION}`;
}
