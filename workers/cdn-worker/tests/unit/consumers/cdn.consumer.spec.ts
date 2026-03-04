import { Test, TestingModule } from '@nestjs/testing';
import { CdnConsumer } from '../../../src/consumers/cdn.consumer';

describe('CdnConsumer', () => {
  let provider: CdnConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CdnConsumer,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<CdnConsumer>(CdnConsumer);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
