import { Test, TestingModule } from '@nestjs/testing';
import { RefundProcessedHandler } from '../../../../src/handlers/razorpay/refund-processed.handler';

describe('RefundProcessedHandler', () => {
  let provider: RefundProcessedHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefundProcessedHandler,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<RefundProcessedHandler>(RefundProcessedHandler);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
