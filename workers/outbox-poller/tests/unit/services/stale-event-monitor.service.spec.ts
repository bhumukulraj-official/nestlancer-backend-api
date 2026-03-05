import { Test, TestingModule } from '@nestjs/testing';
import { StaleEventMonitorService } from '../../../src/services/stale-event-monitor.service';

import { PrismaWriteService } from '@nestlancer/database';
import { ConfigService } from '@nestjs/config';

describe('StaleEventMonitorService', () => {
  let provider: StaleEventMonitorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaleEventMonitorService,
        {
          provide: PrismaWriteService,
          useValue: {
            outboxEvent: {
              count: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(60),
          },
        },
      ],
    }).compile();

    provider = module.get<StaleEventMonitorService>(StaleEventMonitorService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
