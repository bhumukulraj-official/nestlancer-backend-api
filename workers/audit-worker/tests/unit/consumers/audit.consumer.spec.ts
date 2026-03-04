import { Test, TestingModule } from '@nestjs/testing';
import { AuditConsumer } from '../../../src/consumers/audit.consumer';

describe('AuditConsumer', () => {
  let provider: AuditConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditConsumer,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<AuditConsumer>(AuditConsumer);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
