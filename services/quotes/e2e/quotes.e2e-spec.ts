import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

describe('Quotes Service (E2E)', () => {
  let baseUrl: string;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
    baseUrl = `${getAppUrl()}/${prefix}`;
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('GET /quotes without token returns 401', async () => {
    const res = await axios.get(`${baseUrl}/quotes`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(401);
  });
});
