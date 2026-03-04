import { Test, TestingModule } from '@nestjs/testing';
import { WebhookConsumer } from '../../../src/consumers/webhook.consumer';

describe('WebhookConsumer', () => {
  let provider: WebhookConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookConsumer,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<WebhookConsumer>(WebhookConsumer);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
