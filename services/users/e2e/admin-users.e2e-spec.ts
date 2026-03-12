import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

describe('Users Service - Admin Users (E2E)', () => {
  let baseUrl: string;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
    baseUrl = `${getAppUrl()}/${prefix}`;
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('GET /admin/users without token returns 401', async () => {
    const res = await axios.get(`${baseUrl}/admin/users`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(401);
  });
});
