import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

describe('Messaging Service (E2E)', () => {
  let baseUrl: string;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
    baseUrl = `${getAppUrl()}/${prefix}`;
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('GET /conversations without token returns 401', async () => {
    const res = await axios.get(`${baseUrl}/conversations`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(401);
  });

  it('GET /messages without token returns 401', async () => {
    const res = await axios.get(`${baseUrl}/messages`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(401);
  });
});
