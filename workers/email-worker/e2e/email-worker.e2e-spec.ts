import { setupApp, teardownApp, getApp } from './setup';
import { EmailConsumer } from '../src/consumers/email.consumer';
import { EmailWorkerService } from '../src/services/email-worker.service';

describe('Email Worker (E2E)', () => {
  beforeAll(async () => {
    await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('should bootstrap worker and resolve key services', () => {
    const app = getApp();
    expect(app).toBeDefined();
    expect(app.get(EmailConsumer)).toBeDefined();
    expect(app.get(EmailWorkerService)).toBeDefined();
  });
});
