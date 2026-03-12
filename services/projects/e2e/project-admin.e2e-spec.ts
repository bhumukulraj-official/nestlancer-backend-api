import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

describe('Projects Service - Project Admin (E2E)', () => {
  let baseUrl: string;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
    baseUrl = `${getAppUrl()}/${prefix}`;
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('GET /admin/projects without token returns 401', async () => {
    const res = await axios.get(`${baseUrl}/admin/projects`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(401);
  });
});
