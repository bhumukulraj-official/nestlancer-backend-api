import { Test, TestingModule } from '@nestjs/testing';
import { UnreadCountService } from '../../../src/services/unread-count.service';
import { PrismaReadService } from '@nestlancer/database';

describe('UnreadCountService', () => {
  let provider: UnreadCountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnreadCountService,
        {
          provide: PrismaReadService,
          useValue: {
            project: { findMany: jest.fn().mockResolvedValue([]) },
            message: { findMany: jest.fn().mockResolvedValue([]) },
          },
        },
      ],
    }).compile();

    provider = module.get<UnreadCountService>(UnreadCountService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
