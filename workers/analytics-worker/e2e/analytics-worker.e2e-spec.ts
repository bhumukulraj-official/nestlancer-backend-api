import { setupApp, teardownApp, getApp } from './setup';
import { AnalyticsConsumer } from '../src/consumers/analytics.consumer';
import { AnalyticsWorkerService } from '../src/services/analytics-worker.service';

describe('Analytics Worker (E2E)', () => {
  beforeAll(async () => {
    await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('should bootstrap worker and resolve key services', () => {
    const app = getApp();
    expect(app).toBeDefined();
    expect(app.get(AnalyticsConsumer)).toBeDefined();
    expect(app.get(AnalyticsWorkerService)).toBeDefined();
  });
});
