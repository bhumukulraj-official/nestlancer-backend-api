import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

describe('Notifications Service (E2E)', () => {
  let baseUrl: string;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
    baseUrl = `${getAppUrl()}/${prefix}`;
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('GET /notifications without token returns 401', async () => {
    const res = await axios.get(`${baseUrl}/notifications`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(401);
  });
});
