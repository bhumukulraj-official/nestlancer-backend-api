import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

describe('Media Service (E2E)', () => {
  let baseUrl: string;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
    baseUrl = `${getAppUrl()}/${prefix}`;
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('GET /media without token returns 401', async () => {
    const res = await axios.get(`${baseUrl}/media`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(401);
  });
});
