import { Test, TestingModule } from '@nestjs/testing';
import { NotificationSegmentService } from '../../../src/notifications/notification-segment.service';

describe('NotificationSegmentService', () => {
  let provider: NotificationSegmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationSegmentService,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<NotificationSegmentService>(NotificationSegmentService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
