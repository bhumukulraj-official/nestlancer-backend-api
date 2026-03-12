import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

describe('Projects Service - Create Project (E2E)', () => {
  let baseUrl: string;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
    baseUrl = `${getAppUrl()}/${prefix}`;
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('GET /projects without token returns 401', async () => {
    const res = await axios.get(`${baseUrl}/projects`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(401);
  });
});
