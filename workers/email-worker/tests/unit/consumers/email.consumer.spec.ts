import { Test, TestingModule } from '@nestjs/testing';
import { EmailConsumer } from '../../../src/consumers/email.consumer';

describe('EmailConsumer', () => {
  let provider: EmailConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailConsumer,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<EmailConsumer>(EmailConsumer);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
