import { Test, TestingModule } from '@nestjs/testing';
import { AuditConsumer } from '../../../src/consumers/audit.consumer';
import { AuditWorkerService } from '../../../src/services/audit-worker.service';
import { QueueConsumerService } from '@nestlancer/queue';

describe('AuditConsumer', () => {
  let provider: AuditConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditConsumer,
        {
          provide: AuditWorkerService,
          useValue: {
            handleAuditEntry: jest.fn(),
          },
        },
        {
          provide: QueueConsumerService,
          useValue: {
            consume: jest.fn(),
          },
        },
      ],
    }).compile();

    provider = module.get<AuditConsumer>(AuditConsumer);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
