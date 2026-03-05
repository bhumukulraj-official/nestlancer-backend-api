import { Test, TestingModule } from '@nestjs/testing';
import { WebhookConsumer } from '../../../src/consumers/webhook.consumer';
import { LoggerService } from '@nestlancer/logger';
import { OutgoingWebhookProcessor } from '../../../src/processors/outgoing-webhook.processor';
import { RazorpayWebhookProcessor } from '../../../src/processors/razorpay-webhook.processor';
import { GithubWebhookProcessor } from '../../../src/processors/github-webhook.processor';
import { GenericWebhookProcessor } from '../../../src/processors/generic-webhook.processor';

describe('WebhookConsumer', () => {
  let consumer: WebhookConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookConsumer,
        {
          provide: LoggerService,
          useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() },
        },
        {
          provide: OutgoingWebhookProcessor,
          useValue: { handleOutgoing: jest.fn() },
        },
        {
          provide: RazorpayWebhookProcessor,
          useValue: { handleRazorpay: jest.fn() },
        },
        {
          provide: GithubWebhookProcessor,
          useValue: { handleGithub: jest.fn() },
        },
        {
          provide: GenericWebhookProcessor,
          useValue: { handleGeneric: jest.fn() },
        },
      ],
    }).compile();

    consumer = module.get<WebhookConsumer>(WebhookConsumer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });
});
