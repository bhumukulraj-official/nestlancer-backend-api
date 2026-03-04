import { Test, TestingModule } from '@nestjs/testing';
import { NotificationTemplatesService } from '../../../src/notifications/notification-templates.service';

describe('NotificationTemplatesService', () => {
  let provider: NotificationTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationTemplatesService,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<NotificationTemplatesService>(NotificationTemplatesService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
