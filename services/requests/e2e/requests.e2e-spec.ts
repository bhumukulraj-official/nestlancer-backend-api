import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

describe('Requests Service (E2E)', () => {
  let baseUrl: string;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
    baseUrl = `${getAppUrl()}/${prefix}`;
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('GET /requests/health returns 200 with status ok', async () => {
    const res = await axios.get(`${baseUrl}/requests/health`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(200);
    expect(res.data?.data?.status).toBe('ok');
    expect(res.data?.data?.service).toBe('requests');
  });

  it('POST /requests without token returns 401', async () => {
    const res = await axios.post(
      `${baseUrl}/requests`,
      { title: 'Test', description: 'Test', budget: 1000, category: 'WEB_DEVELOPMENT' },
      { validateStatus: () => true },
    );
    expect(res.status).toBe(401);
  });
});
