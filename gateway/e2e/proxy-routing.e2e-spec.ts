import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getBasePath } from './setup';

describe('Gateway - Proxy Routing (E2E)', () => {
  let baseUrl: string;
  const basePath = getBasePath();

  beforeAll(async () => {
    await setupApp();
    baseUrl = getAppUrl();
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('GET /health returns 200 with gateway health status', async () => {
    const res = await axios.get(`${baseUrl}${basePath}/health`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(200);
    expect(res.data?.data?.status).toBe('healthy');
    expect(res.data?.data?.uptime).toBeDefined();
  });

  it('GET /health/live returns alive status', async () => {
    const res = await axios.get(`${baseUrl}${basePath}/health/live`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(200);
    expect(res.data?.data?.status).toBe('alive');
  });

  it('GET /health/ready returns readiness status', async () => {
    const res = await axios.get(`${baseUrl}${basePath}/health/ready`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(200);
    expect(['ready', 'not_ready']).toContain(res.data?.data?.status ?? res.data?.status);
  });

  it('unknown route returns 404', async () => {
    const res = await axios.get(`${baseUrl}${basePath}/nonexistent-route`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(404);
  });
});
