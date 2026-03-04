import { Test, TestingModule } from '@nestjs/testing';
import { UnreadCountService } from '../../../src/services/unread-count.service';

describe('UnreadCountService', () => {
  let provider: UnreadCountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnreadCountService,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<UnreadCountService>(UnreadCountService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
