import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

const uniqueEmail = () =>
  `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

describe('Auth Service - Registration (E2E)', () => {
  let baseUrl: string;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
    baseUrl = `${getAppUrl()}/${prefix}`;
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('should register a new user successfully', async () => {
    const res = await axios.post(
      `${baseUrl}/register`,
      {
        email: uniqueEmail(),
        password: 'StrongP@ssw0rd!',
        firstName: 'Jane',
        lastName: 'Doe',
        acceptTerms: true,
        turnstileToken: 'test-token',
      },
      { validateStatus: () => true },
    );
    expect(res.status).toBe(201);
    expect(res.data?.data?.userId).toBeDefined();
    expect(res.data?.data?.emailVerificationSent).toBe(true);
  });

  it('should reject weak passwords with 400', async () => {
    const res = await axios.post(
      `${baseUrl}/register`,
      {
        email: uniqueEmail(),
        password: '123',
        firstName: 'Weak',
        lastName: 'Password',
        acceptTerms: true,
        turnstileToken: 'test-token',
      },
      { validateStatus: () => true },
    );
    expect(res.status).toBe(400);
  });
});
