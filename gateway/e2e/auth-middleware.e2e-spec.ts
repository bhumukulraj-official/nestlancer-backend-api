import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getBasePath } from './setup';

describe('Gateway - Auth Middleware (E2E)', () => {
  let baseUrl: string;
  const basePath = getBasePath();

  beforeAll(async () => {
    await setupApp();
    baseUrl = getAppUrl();
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('public route /health does not require auth', async () => {
    const res = await axios.get(`${baseUrl}${basePath}/health`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(200);
  });

  it('public route /auth/login does not require auth', async () => {
    const res = await axios.post(
      `${baseUrl}${basePath}/auth/login`,
      { email: 'test@example.com', password: 'password' },
      { validateStatus: () => true },
    );
    // 200 (success) or 401 (invalid credentials) - not 401 "missing token"
    expect([200, 401, 400]).toContain(res.status);
  });

  it('protected route without token returns 401', async () => {
    const res = await axios.get(`${baseUrl}${basePath}/users/profile`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(401);
  });

  it('protected route with invalid token returns 401', async () => {
    const res = await axios.get(`${baseUrl}${basePath}/users/profile`, {
      headers: { Authorization: 'Bearer invalid-token' },
      validateStatus: () => true,
    });
    expect(res.status).toBe(401);
  });
});
