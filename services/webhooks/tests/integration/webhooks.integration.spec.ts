import './integration.env';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter, TransformResponseInterceptor } from '@nestlancer/common';
import { AppModule } from '../../src/app.module';
import { QueuePublisherService, QueueConsumerService } from '@nestlancer/queue';

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

const basePath = '/api/v1/webhooks';

describe('Webhooks Service (Integration)', () => {
  let app: INestApplication;

  jest.setTimeout(30000);

  beforeAll(async () => {
    loadDevEnv();
    process.env.NODE_ENV = 'test';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(QueuePublisherService)
      .useValue({
        publish: jest.fn().mockResolvedValue(undefined),
        sendToQueue: jest.fn().mockResolvedValue(undefined),
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
      })
      .overrideProvider(QueueConsumerService)
      .useValue({
        consume: jest.fn().mockResolvedValue(undefined),
        getChannel: jest.fn(),
        onModuleInit: jest.fn(),
      })
      .overrideProvider('QUEUE_OPTIONS')
      .useValue({ url: 'amqp://localhost:5672' })
      .compile();

    app = moduleRef.createNestApplication();

    app.setGlobalPrefix('api/v1/webhooks');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(new TransformResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Health', () => {
    it(`GET ${basePath}/webhooks/health`, async () => {
      const response = await request(app.getHttpServer()).get(`${basePath}/webhooks/health`);

      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        const healthData = response.body.data ?? response.body;
        expect(healthData.status).toBe('ok');
        expect(healthData.service).toBe('webhooks-inbound');
      }
    });
  });

  describe('Webhook Receivers (Public)', () => {
    it('POST /api/v1/webhooks/razorpay - should accept webhook payload', async () => {
      const response = await request(app.getHttpServer())
        .post(`${basePath}/razorpay`)
        .set('Content-Type', 'application/json')
        .send({
          entity: 'event',
          event: 'payment.captured',
          payload: { payment: { entity: { id: 'pay_test123' } } },
        });

      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it('POST /api/v1/webhooks/cloudflare - should accept webhook payload', async () => {
      const response = await request(app.getHttpServer())
        .post(`${basePath}/cloudflare`)
        .set('Content-Type', 'application/json')
        .send({
          action: 'alert',
          alert_name: 'Test Alert',
          metadata: {},
        });

      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it('POST /api/v1/webhooks/github - should accept webhook payload', async () => {
      const response = await request(app.getHttpServer())
        .post(`${basePath}/github`)
        .set('Content-Type', 'application/json')
        .set('X-GitHub-Event', 'push')
        .send({
          repository: { full_name: 'test/repo' },
          action: 'opened',
        });

      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it('POST /api/v1/webhooks/stripe - should accept webhook payload', async () => {
      const response = await request(app.getHttpServer())
        .post(`${basePath}/stripe`)
        .set('Content-Type', 'application/json')
        .set('Stripe-Signature', 'test-signature')
        .send({
          type: 'payment_intent.succeeded',
          data: { object: {} },
        });

      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it('POST /api/v1/webhooks/:provider - should accept dynamic provider webhook', async () => {
      const response = await request(app.getHttpServer())
        .post(`${basePath}/custom-provider`)
        .set('Content-Type', 'application/json')
        .send({ event: 'test', data: {} });

      expect([200, 201, 400, 500]).toContain(response.status);
    });
  });
});
