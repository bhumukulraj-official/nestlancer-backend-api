import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

describe('Contact Service (E2E)', () => {
  let baseUrl: string;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
    baseUrl = `${getAppUrl()}/${prefix}`;
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('GET /contact/health returns 200 with status healthy', async () => {
    const res = await axios.get(`${baseUrl}/contact/health`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(200);
    expect(res.data?.data?.status).toBe('healthy');
    expect(res.data?.data?.service).toBe('contact');
  });

  it('POST /contact without body returns 400', async () => {
    const res = await axios.post(`${baseUrl}/contact`, {}, {
      validateStatus: () => true,
    });
    expect([400, 422]).toContain(res.status);
  });
});
