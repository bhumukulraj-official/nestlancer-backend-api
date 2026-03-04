import { Test, TestingModule } from '@nestjs/testing';
import { MessageThreadsService } from '../../../src/services/message-threads.service';

describe('MessageThreadsService', () => {
  let provider: MessageThreadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageThreadsService,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<MessageThreadsService>(MessageThreadsService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
