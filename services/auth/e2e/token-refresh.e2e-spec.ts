import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

describe('Auth Service - Token Refresh (E2E)', () => {
  let baseUrl: string;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
    baseUrl = `${getAppUrl()}/${prefix}`;
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('POST /refresh with invalid token returns 401', async () => {
    const res = await axios.post(
      `${baseUrl}/refresh`,
      { refreshToken: 'invalid-refresh-token' },
      { validateStatus: () => true },
    );
    expect([401, 400]).toContain(res.status);
  });
});
