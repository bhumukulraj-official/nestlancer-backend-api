import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

describe('Payments Service - Payment Intent (E2E)', () => {
  let baseUrl: string;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
    baseUrl = `${getAppUrl()}/${prefix}`;
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('POST /payments/create-intent without token returns 401', async () => {
    const res = await axios.post(
      `${baseUrl}/payments/create-intent`,
      { projectId: 'test', milestoneId: 'test', amount: 1000 },
      { validateStatus: () => true },
    );
    expect(res.status).toBe(401);
  });
});
