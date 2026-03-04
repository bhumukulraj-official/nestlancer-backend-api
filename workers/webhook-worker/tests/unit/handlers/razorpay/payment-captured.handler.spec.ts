import { Test, TestingModule } from '@nestjs/testing';
import { PaymentCapturedHandler } from '../../../../src/handlers/razorpay/payment-captured.handler';

describe('PaymentCapturedHandler', () => {
  let provider: PaymentCapturedHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentCapturedHandler,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<PaymentCapturedHandler>(PaymentCapturedHandler);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
