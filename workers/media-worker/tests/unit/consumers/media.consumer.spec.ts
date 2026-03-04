import { Test, TestingModule } from '@nestjs/testing';
import { MediaConsumer } from '../../../src/consumers/media.consumer';

describe('MediaConsumer', () => {
  let provider: MediaConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaConsumer,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<MediaConsumer>(MediaConsumer);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
