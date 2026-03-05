import { Test, TestingModule } from '@nestjs/testing';
import { EmailConsumer } from '../../../src/consumers/email.consumer';
import { QueueConsumerService } from '@nestlancer/queue';
import { EmailWorkerService } from '../../../src/services/email-worker.service';
import { ConfigService } from '@nestjs/config';

describe('EmailConsumer', () => {
  let consumer: EmailConsumer;
  let queueConsumerService: jest.Mocked<QueueConsumerService>;
  let emailWorkerService: jest.Mocked<EmailWorkerService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailConsumer,
        {
          provide: QueueConsumerService,
          useValue: { consume: jest.fn() },
        },
        {
          provide: EmailWorkerService,
          useValue: { processEmail: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('email.queue') },
        },
      ],
    }).compile();

    consumer = module.get<EmailConsumer>(EmailConsumer);
    queueConsumerService = module.get(QueueConsumerService);
    emailWorkerService = module.get(EmailWorkerService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should start consuming from the configured queue', async () => {
      await consumer.onModuleInit();
      expect(queueConsumerService.consume).toHaveBeenCalledWith('email.queue', expect.any(Function));
    });

    it('should process messages correctly', async () => {
      let messageHandler: any;
      queueConsumerService.consume.mockImplementation(async (queue, handler) => {
        messageHandler = handler;
      });

      await consumer.onModuleInit();

      const mockMsg = {
        content: Buffer.from(JSON.stringify({ to: 'test@example.com', subject: 'Test' })),
      };

      await messageHandler(mockMsg);

      expect(emailWorkerService.processEmail).toHaveBeenCalledWith({ to: 'test@example.com', subject: 'Test' });
    });
  });
});
