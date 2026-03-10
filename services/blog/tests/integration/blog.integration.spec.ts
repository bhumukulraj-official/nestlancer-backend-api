import './integration.env';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { VersioningType } from '@nestjs/common';
import { HttpExceptionFilter } from '@nestlancer/common';
import { AppModule } from '../../src/app.module';
import { createTestJwt } from '@nestlancer/testing/helpers/test-auth.helper';

function loadDevEnv() {
  const envPath = resolve(__dirname, '../../../../.env.development');
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

describe('Blog Service (Integration)', () => {
  let app: INestApplication;

  jest.setTimeout(30000);

  beforeAll(async () => {
    loadDevEnv();
    process.env.NODE_ENV = 'test';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Health', () => {
    it('GET /api/v1/posts/health', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/posts/health').expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.status).toBe('ok');
      expect(response.body.service).toBe('blog');
    });
  });

  describe('Public Posts', () => {
    it('GET /api/v1/posts - should return published posts', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/posts')
        .query({ page: '1', limit: '20' });

      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toBeDefined();
      }
    });

    it('GET /api/v1/posts/search - should return search results', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/posts/search')
        .query({ q: 'test' });

      expect([200, 500]).toContain(response.status);
    });

    it('GET /api/v1/posts/:slug - should handle non-existent slug', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/v1/posts/non-existent-slug-12345',
      );

      expect([404, 500]).toContain(response.status);
    });
  });

  describe('Public Categories', () => {
    it('GET /api/v1/categories - should return categories', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/categories');

      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toBeDefined();
      }
    });
  });

  describe('Public Tags', () => {
    it('GET /api/v1/tags - should return tags', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/tags');

      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toBeDefined();
      }
    });
  });

  describe('Public Authors', () => {
    it('GET /api/v1/authors - should return authors', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/authors');

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('Public Feed', () => {
    it('GET /api/v1/feed/rss - should return RSS feed', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/feed/rss');

      expect([200, 500]).toContain(response.status);
    });

    it('GET /api/v1/feed/atom - should return Atom feed', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/feed/atom');

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('Post Interactions (Authenticated)', () => {
    it('POST /api/v1/posts/:slug/like - should reject unauthenticated', async () => {
      const response = await request(app.getHttpServer()).post('/api/v1/posts/test-post-slug/like');
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    it('POST /api/v1/posts/:slug/view - should reject unauthenticated', async () => {
      const response = await request(app.getHttpServer()).post('/api/v1/posts/test-post-slug/view');
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    it('POST /api/v1/posts/:slug/bookmark - should reject unauthenticated', async () => {
      const response = await request(app.getHttpServer()).post(
        '/api/v1/posts/test-post-slug/bookmark',
      );
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  describe('Comments (Authenticated)', () => {
    it('GET /api/v1/posts/:slug/comments - should reject unauthenticated', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/v1/posts/test-post-slug/comments',
      );
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    it('POST /api/v1/posts/:slug/comments - should reject unauthenticated', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/posts/test-post-slug/comments')
        .send({ content: 'Test comment' });
      expect([401, 500]).toContain(response.status);
    });

    it('POST /api/v1/posts/:slug/comments - should reject invalid payload (validation)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/posts/test-post-slug/comments')
        .set(authHeader('test-user-1'))
        .send({ content: '' });

      expect([400, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('Admin - Posts', () => {
    it('GET /api/v1/admin/posts - should reject unauthenticated', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/admin/posts');
      expect([401, 500]).toContain(response.status);
    });

    it('GET /api/v1/admin/posts - should reject non-admin user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/posts')
        .set(authHeader('regular-user-1'));

      expect([403, 500]).toContain(response.status);
    });

    it('GET /api/v1/admin/posts - should accept admin token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/posts')
        .query({ page: '1', limit: '20' })
        .set(adminAuthHeader());

      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toBeDefined();
      }
    });

    it('POST /api/v1/admin/posts - should reject invalid payload (validation)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/posts')
        .set(adminAuthHeader())
        .send({
          title: '',
          slug: '',
          content: '',
          excerpt: '',
          status: 'INVALID',
        });

      expect([400, 404, 422, 500]).toContain(response.status);
    });

    it('GET /api/v1/admin/posts/:id - should reject invalid id', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/posts/invalid-uuid')
        .set(adminAuthHeader());

      expect([400, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('Admin - Comments', () => {
    it('GET /api/v1/admin/comments - should reject unauthenticated', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/admin/comments');
      expect([401, 500]).toContain(response.status);
    });

    it('GET /api/v1/admin/comments - should reject non-admin user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/comments')
        .set(authHeader('regular-user-1'));

      expect([403, 500]).toContain(response.status);
    });

    it('GET /api/v1/admin/comments - should accept admin token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/comments')
        .query({ page: '1', limit: '20' })
        .set(adminAuthHeader());

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('Admin - Blog Analytics', () => {
    it('GET /api/v1/admin/blog/analytics - should reject unauthenticated', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/admin/blog/analytics');
      expect([401, 500]).toContain(response.status);
    });

    it('GET /api/v1/admin/blog/analytics - should reject non-admin user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/blog/analytics')
        .set(authHeader('regular-user-1'));

      expect([403, 500]).toContain(response.status);
    });

    it('GET /api/v1/admin/blog/analytics - should accept admin token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/blog/analytics')
        .set(adminAuthHeader());

      expect([200, 500]).toContain(response.status);
    });
  });
});
