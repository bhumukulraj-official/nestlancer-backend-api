import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

describe('Admin Service (E2E)', () => {
  let baseUrl: string;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
    baseUrl = `${getAppUrl()}/${prefix}`;
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('GET /dashboard without token returns 401', async () => {
    const res = await axios.get(`${baseUrl}/dashboard`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(401);
  });
});
