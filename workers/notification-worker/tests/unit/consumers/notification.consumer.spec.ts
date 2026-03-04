import { Test, TestingModule } from '@nestjs/testing';
import { NotificationConsumer } from '../../../src/consumers/notification.consumer';

describe('NotificationConsumer', () => {
  let provider: NotificationConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationConsumer,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<NotificationConsumer>(NotificationConsumer);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
