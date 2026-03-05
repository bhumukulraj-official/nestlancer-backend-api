import { Test, TestingModule } from '@nestjs/testing';
import { NotificationConsumer } from '../../../src/consumers/notification.consumer';
import { QueueConsumerService } from '@nestlancer/queue';
import { NotificationWorkerService } from '../../../src/services/notification-worker.service';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel } from '../../../src/interfaces/notification-job.interface';

describe('NotificationConsumer', () => {
  let consumer: NotificationConsumer;
  let queueConsumerService: jest.Mocked<QueueConsumerService>;
  let notificationWorkerService: jest.Mocked<NotificationWorkerService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationConsumer,
        {
          provide: QueueConsumerService,
          useValue: { consume: jest.fn() },
        },
        {
          provide: NotificationWorkerService,
          useValue: { processNotification: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    consumer = module.get<NotificationConsumer>(NotificationConsumer);
    queueConsumerService = module.get(QueueConsumerService);
    notificationWorkerService = module.get(NotificationWorkerService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should start consuming from the configured queue', async () => {
      const queueName = 'test.notification.queue';
      configService.get.mockReturnValue(queueName);

      await consumer.onModuleInit();

      expect(queueConsumerService.consume).toHaveBeenCalledWith(queueName, expect.any(Function));
    });

    it('should process messages using NotificationWorkerService', async () => {
      configService.get.mockReturnValue('test.queue');
      let messageHandler: (msg: any) => Promise<void>;
      queueConsumerService.consume.mockImplementation(async (queue, handler) => {
        messageHandler = handler;
      });

      await consumer.onModuleInit();

      const mockJob = {
        userId: 'user-1',
        type: 'ORDER_UPDATE',
        channels: [NotificationChannel.IN_APP],
        notification: { title: 'Test', message: 'Body' }
      };
      const mockMsg = { content: Buffer.from(JSON.stringify(mockJob)) };

      await messageHandler!(mockMsg);

      expect(notificationWorkerService.processNotification).toHaveBeenCalledWith(mockJob);
    });
  });
});
