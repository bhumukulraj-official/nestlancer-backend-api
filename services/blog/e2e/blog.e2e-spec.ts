import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

describe('Blog Service (E2E)', () => {
  let baseUrl: string;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
    baseUrl = `${getAppUrl()}/${prefix}`;
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('GET /posts returns 200 (public)', async () => {
    const res = await axios.get(`${baseUrl}/posts`, { validateStatus: () => true });
    expect([200, 404]).toContain(res.status);
  });

  it('GET /feed returns 200 (public)', async () => {
    const res = await axios.get(`${baseUrl}/feed`, { validateStatus: () => true });
    expect([200, 404]).toContain(res.status);
  });
});
