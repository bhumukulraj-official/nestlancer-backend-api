import axios from 'axios';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

describe('Payments Service - Razorpay Webhook (E2E)', () => {
  let baseUrl: string;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
    baseUrl = `${getAppUrl()}/${prefix}`;
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('POST /webhooks/razorpay with invalid payload returns 4xx', async () => {
    const res = await axios.post(
      `${baseUrl}/webhooks/razorpay`,
      { event: 'payment.captured', payload: {} },
      { validateStatus: () => true },
    );
    expect([400, 401, 422]).toContain(res.status);
  });
});
