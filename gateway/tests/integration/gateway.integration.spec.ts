import './integration.env';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { of, throwError } from 'rxjs';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { UsersController } from '../../src/modules/users/users.controller';
import {
  AppValidationPipe,
  AllExceptionsFilter,
  TransformResponseInterceptor,
  API_PREFIX,
  API_VERSION,
} from '@nestlancer/common';
import { AppModule } from '../../src/app.module';
import { CacheService } from '@nestlancer/cache';
import { NestlancerConfigService } from '@nestlancer/config';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { HttpService } from '@nestjs/axios';
import { createTestJwt } from '@nestlancer/testing/helpers/test-auth.helper';

const basePath = `/${API_PREFIX}/${API_VERSION}`;

function loadDevEnv() {
  const envPath = resolve(__dirname, '../../../.env.development');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...value] = trimmed.split('=');
      if (key) {
        process.env[key.trim()] = value
          .join('=')
          .trim()
          .replace(/^["']|["']$/g, '');
      }
    }
  });
}

function authHeader(userId: string, role = 'USER') {
  const token = createTestJwt(
    { sub: userId, email: `${userId}@test.com`, role },
    { secret: process.env.JWT_ACCESS_SECRET },
  );
  return { Authorization: `Bearer ${token}` };
}

function adminAuthHeader() {
  return authHeader('admin-1', 'ADMIN');
}

describe('Gateway (Integration)', () => {
  let app: INestApplication;
  let httpService: HttpService;

  jest.setTimeout(30000);

  beforeAll(async () => {
    loadDevEnv();
    process.env.NODE_ENV = 'test';

    const mockCacheService = {
      getClient: jest.fn().mockReturnValue({
        on: jest.fn(),
        quit: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        get: jest.fn(),
      }),
    };

    const mockHttpResponse = (data: unknown = { status: 'ok' }) =>
      of({ data, status: 200, headers: {} });

    const mockHttpService = {
      request: jest.fn().mockImplementation((config: { url?: string }) => {
        if (config.url?.includes('/health')) {
          return mockHttpResponse({ status: 'ok', service: 'health' });
        }
        if (config.url?.includes('/auth/')) {
          return mockHttpResponse({ accessToken: 'mock-token', user: { id: '1' } });
        }
        return mockHttpResponse();
      }),
      get: jest.fn().mockReturnValue(mockHttpResponse({ status: 'ok' })),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CacheService)
      .useValue(mockCacheService)
      .overrideProvider(PrismaWriteService)
      .useValue({})
      .overrideProvider(PrismaReadService)
      .useValue({})
      .overrideProvider(HttpService)
      .useValue(mockHttpService)
      .overrideProvider(NestlancerConfigService)
      .useValue({
        port: 3000,
        get: jest.fn().mockReturnValue('mocked-value'),
      })
      .compile();

    app = moduleRef.createNestApplication();

    app.setGlobalPrefix(`${API_PREFIX}/${API_VERSION}`);
    app.useGlobalPipes(new AppValidationPipe());
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformResponseInterceptor());

    await app.init();

    httpService = app.get<HttpService>(HttpService);
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // Helper to easily simulate proxy errors
  const mockProxyError = (status: number, data: any = {}) => {
    const error: any = new Error(`Request failed with status code ${status}`);
    error.isAxiosError = true;
    error.response = { status, data, headers: {} };
    return throwError(() => error);
  };

  describe('Health (Gateway Local)', () => {
    it(`GET ${basePath}/health - gateway health check`, async () => {
      const response = await request(app.getHttpServer()).get(`${basePath}/health`).expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data.uptime).toBeDefined();
    });

    it(`GET ${basePath}/health/live - liveness probe`, async () => {
      const response = await request(app.getHttpServer())
        .get(`${basePath}/health/live`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.status).toBe('alive');
      expect(response.body.data.uptime).toBeDefined();
    });

    it(`GET ${basePath}/health/detailed - aggregated health`, async () => {
      const response = await request(app.getHttpServer())
        .get(`${basePath}/health/detailed`)
        .expect(200);

      expect(response.body.status).toBe('success');
      const data = response.body.data || response.body;
      expect(['up', 'down', 'degraded']).toContain(data.status);
      expect(data.services).toBeDefined();
    });

    it(`GET ${basePath}/health/ready - readiness probe`, async () => {
      await request(app.getHttpServer())
        .get(`${basePath}/health/ready`)
        .expect(200);
    });

    it(`GET ${basePath}/health/dependencies - dependency health`, async () => {
      const response = await request(app.getHttpServer())
        .get(`${basePath}/health/dependencies`)
        .expect(200);

      expect(response.body.status).toBeDefined();
      const data = response.body.data || response.body;
      expect(data.services).toBeDefined();
    });

    it(`GET ${basePath}/health/services/:name - specific service health`, async () => {
      const response = await request(app.getHttpServer())
        .get(`${basePath}/health/services/auth`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.service).toBe('auth');
      expect(response.body.data.status).toBeDefined();
    });
  });

  describe('Auth (Proxied)', () => {
    it(`POST ${basePath}/auth/login - should authenticate user and proxy successfully`, async () => {
      const response = await request(app.getHttpServer())
        .post(`${basePath}/auth/login`)
        .send({ email: 'test@example.com', password: 'password' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
    });

    it(`POST ${basePath}/auth/login - proxy returns 401 Unauthorized`, async () => {
      jest.spyOn(httpService, 'request').mockReturnValueOnce(mockProxyError(401, { message: 'Invalid credentials' }));

      const response = await request(app.getHttpServer())
        .post(`${basePath}/auth/login`)
        .send({ email: 'test@example.com', password: 'wrongpassword' })
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.error?.message).toBe('Invalid credentials');
    });

    it(`POST ${basePath}/auth/register - success`, async () => {
      const response = await request(app.getHttpServer()).post(`${basePath}/auth/register`).send({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        acceptTerms: true,
      }).expect(201);

      expect(response.body.status).toBe('success');
    });

    it(`GET ${basePath}/auth/check-email - proxies query successfuly`, async () => {
      const response = await request(app.getHttpServer())
        .get(`${basePath}/auth/check-email`)
        .query({ email: 'test@example.com' })
        .expect(200);

      expect(response.body.status).toBe('success');
    });

  });

  describe('Users (Proxied)', () => {
    it(`GET ${basePath}/users/profile - proxy forwards 401 when no auth provided`, async () => {
      jest.spyOn(httpService, 'request').mockReturnValueOnce(mockProxyError(401, { message: 'Unauthorized' }));

      const response = await request(app.getHttpServer())
        .get(`${basePath}/users/profile`)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.error?.message).toBe('Unauthorized');
    });

    it(`GET ${basePath}/users/profile - successfully proxies with auth header`, async () => {
      jest.spyOn(httpService, 'request').mockReturnValueOnce(of({ data: { id: 'test-user-1', name: 'John Doe' }, status: 200, headers: {} } as any));

      const response = await request(app.getHttpServer())
        .get(`${basePath}/users/profile`)
        .set(authHeader('test-user-1'))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe('test-user-1');
    });

    it(`PATCH ${basePath}/users/profile - successfully proxies valid payload`, async () => {
      jest.spyOn(httpService, 'request').mockReturnValueOnce(of({ data: { success: true }, status: 200, headers: {} } as any));

      const response = await request(app.getHttpServer())
        .patch(`${basePath}/users/profile`)
        .set(authHeader('test-user-1'))
        .send({ firstName: 'Johnny' })
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });

  describe('Admin (Proxied)', () => {
    it(`GET ${basePath}/admin/users - denies access (403 or 401) if not admin`, async () => {
      jest.spyOn(httpService, 'request').mockReturnValueOnce(mockProxyError(403, { message: 'Forbidden' }));

      const response = await request(app.getHttpServer())
        .get(`${basePath}/admin/users`)
        .set(authHeader('user-1', 'USER'))
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it(`GET ${basePath}/admin/users - accepts admin token and passes query params`, async () => {
      jest.spyOn(httpService, 'request').mockImplementationOnce((config: any) => {
        expect(config.params).toEqual({ page: '1', limit: '20' });
        return of({ data: { items: [], total: 0 }, status: 200, headers: {} } as any);
      });

      const response = await request(app.getHttpServer())
        .get(`${basePath}/admin/users`)
        .query({ page: '1', limit: '20' })
        .set(adminAuthHeader())
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.items).toBeDefined();
    });
  });

  describe('Requests (Proxied)', () => {
    it(`GET ${basePath}/requests - lists requests via proxy`, async () => {
      jest.spyOn(httpService, 'request').mockReturnValueOnce(of({ data: [], status: 200, headers: {} } as any));

      const response = await request(app.getHttpServer())
        .get(`${basePath}/requests`)
        .set(authHeader('test-user-1'))
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });

  describe('Quotes (Proxied)', () => {
    it(`GET ${basePath}/quotes - forwards via proxy`, async () => {
      jest.spyOn(httpService, 'request').mockReturnValueOnce(of({ data: [], status: 200, headers: {} } as any));

      const response = await request(app.getHttpServer()).get(`${basePath}/quotes`).expect(200);

      expect(response.body.status).toBe('success');
    });
  });

  describe('Projects (Proxied)', () => {
    it(`GET ${basePath}/projects - forwards via proxy`, async () => {
      jest.spyOn(httpService, 'request').mockReturnValueOnce(of({ data: [], status: 200, headers: {} } as any));

      const response = await request(app.getHttpServer()).get(`${basePath}/projects`).expect(200);

      expect(response.body.status).toBe('success');
    });
  });

  describe('Contact (Proxied)', () => {
    it(`POST ${basePath}/contact - succeeds for valid message payload`, async () => {
      const response = await request(app.getHttpServer())
        .post(`${basePath}/contact`)
        .send({
          email: 'test@example.com',
          subject: 'Help',
          message: 'This is a long enough message to pass validation.',
        })
        .expect(201);

      expect(response.body.status).toBe('success');
    });

    it(`POST ${basePath}/contact - proxies invalid payload to downstream (gateway does not validate)`, async () => {
      const response = await request(app.getHttpServer())
        .post(`${basePath}/contact`)
        .send({
          email: 'invalid',
          subject: 'a',
          message: 'short',
        })
        .expect(201);

      expect(response.body.status).toBe('success');
    });
  });

  describe('Proxy Routing', () => {
    it('should route auth/login correctly to downstream service', async () => {
      const authController = app.get(AuthController);
      const requestSpy = jest.spyOn(httpService, 'request');

      const mockRequest = {
        method: 'POST',
        path: `${basePath}/auth/login`,
        body: { email: 'test@example.com', password: 'password' },
        headers: {},
      } as any;

      await authController.login(mockRequest);

      expect(requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'http://localhost:3001/api/v1/auth/login',
          method: 'POST',
        }),
      );
    });

    it('should route users/profile correctly and strip /users segment', async () => {
      const usersController = app.get(UsersController);
      const requestSpy = jest.spyOn(httpService, 'request');

      const mockRequest = {
        method: 'GET',
        path: `${basePath}/users/profile`,
        body: {},
        headers: {},
      } as any;

      await usersController.getProfile(mockRequest);

      expect(requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'http://localhost:3002/api/v1/profile',
          method: 'GET',
        }),
      );
    });
  });
});
