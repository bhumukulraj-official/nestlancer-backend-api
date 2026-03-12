import { setupApp, teardownApp, getApp } from './setup';
import { AuditConsumer } from '../src/consumers/audit.consumer';
import { AuditWorkerService } from '../src/services/audit-worker.service';

describe('Audit Worker (E2E)', () => {
  beforeAll(async () => {
    await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('should bootstrap worker and resolve key services', () => {
    const app = getApp();
    expect(app).toBeDefined();
    expect(app.get(AuditConsumer)).toBeDefined();
    expect(app.get(AuditWorkerService)).toBeDefined();
  });
});
