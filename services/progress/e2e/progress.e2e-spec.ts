import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

describe('Progress Service (E2E)', () => {
  let baseUrl: string;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
    baseUrl = `${getAppUrl()}/${prefix}`;
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('GET /milestones without token returns 401', async () => {
    const res = await axios.get(`${baseUrl}/milestones`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(401);
  });
});
