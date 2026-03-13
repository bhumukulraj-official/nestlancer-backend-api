import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

describe('Health Service (E2E)', () => {
  let baseUrl: string;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
    baseUrl = `${getAppUrl()}/${prefix}`;
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('GET / returns aggregated health with valid status', async () => {
    const res = await axios.get(`${baseUrl}/`, { validateStatus: () => true });

    expect([200, 206, 503]).toContain(res.status);
    expect(res.data).toHaveProperty('status');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(res.data.status);
    expect(res.data).toHaveProperty('services');
    expect(res.data).toHaveProperty('checks');
  });

  it(
    'GET /detailed returns detailed health diagnostics',
    async () => {
      const res = await axios.get(`${baseUrl}/detailed`, { validateStatus: () => true });

      expect([200, 206, 503]).toContain(res.status);
      expect(res.data).toHaveProperty('status');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(res.data.status);
      expect(res.data).toHaveProperty('detailed', true);
    },
    90_000,
  );

  it('GET /ready returns readiness status', async () => {
    const res = await axios.get(`${baseUrl}/ready`, { validateStatus: () => true });

    expect([200, 503]).toContain(res.status);
    expect(res.data).toHaveProperty('status');
    expect(['ready', 'not_ready']).toContain(res.data.status);
    expect(res.data).toHaveProperty('checks');
  });

  it('GET /live returns liveness status', async () => {
    const res = await axios.get(`${baseUrl}/live`, { validateStatus: () => true });

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({
      status: 'alive',
    });
    expect(typeof res.data.uptime).toBe('number');
  });

  it('HEAD /ping returns 200', async () => {
    const res = await axios.head(`${baseUrl}/ping`, { validateStatus: () => true });
    expect(res.status).toBe(200);
  });

  it('GET /database returns database health status', async () => {
    const res = await axios.get(`${baseUrl}/database`, { validateStatus: () => true });

    expect([200, 503]).toContain(res.status);
    expect(res.data).toHaveProperty('status');
  });

  it('GET /cache returns cache health status', async () => {
    const res = await axios.get(`${baseUrl}/cache`, { validateStatus: () => true });

    expect([200, 503]).toContain(res.status);
    expect(res.data).toHaveProperty('status');
  });

  it('GET /queue returns queue health status', async () => {
    const res = await axios.get(`${baseUrl}/queue`, { validateStatus: () => true });

    expect([200, 503]).toContain(res.status);
    expect(res.data).toHaveProperty('status');
  });

  it('GET /storage returns storage health status', async () => {
    const res = await axios.get(`${baseUrl}/storage`, { validateStatus: () => true });

    expect([200, 503]).toContain(res.status);
    expect(res.data).toHaveProperty('status');
  });

  it('GET /microservices returns inter-service health overview', async () => {
    const res = await axios.get(`${baseUrl}/microservices`, { validateStatus: () => true });

    expect([200, 503]).toContain(res.status);
    expect(res.data).toHaveProperty('status');
  });

  it('GET /external returns external services health status', async () => {
    const res = await axios.get(`${baseUrl}/external`, { validateStatus: () => true });

    expect([200, 503]).toContain(res.status);
    expect(res.data).toHaveProperty('status');
  });

  it('GET /workers returns workers health status', async () => {
    const res = await axios.get(`${baseUrl}/workers`, { validateStatus: () => true });

    expect([200, 503]).toContain(res.status);
    expect(res.data).toHaveProperty('status');
  });

  it('GET /websocket returns websocket health status', async () => {
    const res = await axios.get(`${baseUrl}/websocket`, { validateStatus: () => true });

    expect([200, 503]).toContain(res.status);
    expect(res.data).toHaveProperty('status');
  });

  it('GET /system returns system metrics', async () => {
    const res = await axios.get(`${baseUrl}/system`, { validateStatus: () => true });

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('status');
    expect(res.data).toHaveProperty('memory');
    expect(res.data).toHaveProperty('cpu');
  });

  it('GET /features returns feature flags health', async () => {
    const res = await axios.get(`${baseUrl}/features`, { validateStatus: () => true });

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('status');
  });

  it('GET /registry returns registry health status', async () => {
    const res = await axios.get(`${baseUrl}/registry`, { validateStatus: () => true });

    expect([200, 503]).toContain(res.status);
    expect(res.data).toHaveProperty('status');
  });
});
