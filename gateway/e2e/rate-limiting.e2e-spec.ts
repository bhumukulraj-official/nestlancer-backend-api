import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getBasePath } from './setup';

/**
 * Rate limiting E2E: verifies gateway responds to health (no rate limit on health).
 * If rate limiting is added to the gateway later, assertions can be extended
 * to check 429 after N requests.
 */
describe('Gateway - Rate Limiting (E2E)', () => {
  let baseUrl: string;
  const basePath = getBasePath();

  beforeAll(async () => {
    await setupApp();
    baseUrl = getAppUrl();
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('health endpoint is accessible without rate limit rejection', async () => {
    const res = await axios.get(`${baseUrl}${basePath}/health`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(200);
    expect(res.data?.data?.status).toBe('healthy');
  });

  it('multiple health requests succeed', async () => {
    const requests = Array.from({ length: 5 }, () =>
      axios.get(`${baseUrl}${basePath}/health`, { validateStatus: () => true }),
    );
    const results = await Promise.all(requests);
    results.forEach((res) => {
      expect(res.status).toBe(200);
    });
  });
});
