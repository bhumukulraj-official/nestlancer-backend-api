import { Test, TestingModule } from '@nestjs/testing';
import { NotificationBroadcastService } from '../../../src/notifications/notification-broadcast.service';
import { QueuePublisherService } from '@nestlancer/queue';
import { PrismaWriteService } from '@nestlancer/database';

describe('NotificationBroadcastService', () => {
  let provider: NotificationBroadcastService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationBroadcastService,
        { provide: QueuePublisherService, useValue: {} },
        { provide: PrismaWriteService, useValue: {} },
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<NotificationBroadcastService>(NotificationBroadcastService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
