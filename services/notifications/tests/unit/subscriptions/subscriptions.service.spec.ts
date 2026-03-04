import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from '../../../src/subscriptions/subscriptions.service';

describe('SubscriptionsService', () => {
  let provider: SubscriptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<SubscriptionsService>(SubscriptionsService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
