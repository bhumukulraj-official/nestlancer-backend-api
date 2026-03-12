import { setupApp, teardownApp, getApp } from './setup';
import { WebhookConsumer } from '../src/consumers/webhook.consumer';
import { WebhookWorkerService } from '../src/services/webhook-worker.service';

describe('Webhook Worker (E2E)', () => {
  beforeAll(async () => {
    await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('should bootstrap worker and resolve key services', () => {
    const app = getApp();
    expect(app).toBeDefined();
    expect(app.get(WebhookConsumer)).toBeDefined();
    expect(app.get(WebhookWorkerService)).toBeDefined();
  });
});
