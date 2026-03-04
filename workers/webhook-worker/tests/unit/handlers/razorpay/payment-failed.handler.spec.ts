import { Test, TestingModule } from '@nestjs/testing';
import { PaymentFailedHandler } from '../../../../src/handlers/razorpay/payment-failed.handler';

describe('PaymentFailedHandler', () => {
  let provider: PaymentFailedHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentFailedHandler,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<PaymentFailedHandler>(PaymentFailedHandler);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
