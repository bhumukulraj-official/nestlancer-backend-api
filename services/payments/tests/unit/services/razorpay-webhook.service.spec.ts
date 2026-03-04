import { Test, TestingModule } from '@nestjs/testing';
import { RazorpayWebhookService } from '../../../src/services/razorpay-webhook.service';

describe('RazorpayWebhookService', () => {
  let provider: RazorpayWebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RazorpayWebhookService,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<RazorpayWebhookService>(RazorpayWebhookService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
