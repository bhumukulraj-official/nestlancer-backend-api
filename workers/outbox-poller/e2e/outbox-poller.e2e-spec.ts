import { setupApp, teardownApp, getApp } from './setup';
import { OutboxPollerService } from '../src/services/outbox-poller.service';
import { OutboxPublisherService } from '../src/services/outbox-publisher.service';

describe('Outbox Poller (E2E)', () => {
  beforeAll(async () => {
    await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('should bootstrap worker and resolve key services', () => {
    const app = getApp();
    expect(app).toBeDefined();
    expect(app.get(OutboxPollerService)).toBeDefined();
    expect(app.get(OutboxPublisherService)).toBeDefined();
  });
});
