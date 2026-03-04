import { Test, TestingModule } from '@nestjs/testing';
import { DisputeCreatedHandler } from '../../../../src/handlers/razorpay/dispute-created.handler';

describe('DisputeCreatedHandler', () => {
  let provider: DisputeCreatedHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputeCreatedHandler,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<DisputeCreatedHandler>(DisputeCreatedHandler);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
