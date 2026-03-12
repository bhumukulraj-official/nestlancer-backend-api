import { setupApp, teardownApp, getApp } from './setup';
import { CdnConsumer } from '../src/consumers/cdn.consumer';
import { CdnWorkerService } from '../src/services/cdn-worker.service';

describe('CDN Worker (E2E)', () => {
  beforeAll(async () => {
    await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('should bootstrap worker and resolve key services', () => {
    const app = getApp();
    expect(app).toBeDefined();
    expect(app.get(CdnConsumer)).toBeDefined();
    expect(app.get(CdnWorkerService)).toBeDefined();
  });
});
