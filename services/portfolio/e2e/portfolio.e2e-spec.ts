import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

describe('Portfolio Service (E2E)', () => {
  let baseUrl: string;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
    baseUrl = `${getAppUrl()}/${prefix}`;
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('GET /portfolio without token returns 401 or 200 depending on route', async () => {
    const res = await axios.get(`${baseUrl}/portfolio`, {
      validateStatus: () => true,
    });
    expect([200, 401]).toContain(res.status);
  });
});
