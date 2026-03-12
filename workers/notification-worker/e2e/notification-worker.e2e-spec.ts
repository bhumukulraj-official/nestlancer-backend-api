import { setupApp, teardownApp, getApp } from './setup';
import { NotificationConsumer } from '../src/consumers/notification.consumer';
import { NotificationWorkerService } from '../src/services/notification-worker.service';

describe('Notification Worker (E2E)', () => {
  beforeAll(async () => {
    await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('should bootstrap worker and resolve key services', () => {
    const app = getApp();
    expect(app).toBeDefined();
    expect(app.get(NotificationConsumer)).toBeDefined();
    expect(app.get(NotificationWorkerService)).toBeDefined();
  });
});
