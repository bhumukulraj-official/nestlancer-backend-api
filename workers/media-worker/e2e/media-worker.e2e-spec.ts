import { setupApp, teardownApp, getApp } from './setup';
import { MediaConsumer } from '../src/consumers/media.consumer';
import { MediaWorkerService } from '../src/services/media-worker.service';

describe('Media Worker (E2E)', () => {
  beforeAll(async () => {
    await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('should bootstrap worker and resolve key services', () => {
    const app = getApp();
    expect(app).toBeDefined();
    expect(app.get(MediaConsumer)).toBeDefined();
    expect(app.get(MediaWorkerService)).toBeDefined();
  });
});
