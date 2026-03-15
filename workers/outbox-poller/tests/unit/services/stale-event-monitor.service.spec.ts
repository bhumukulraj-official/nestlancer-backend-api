import { Test, TestingModule } from '@nestjs/testing';
import { StaleEventMonitorService } from '../../../src/services/stale-event-monitor.service';
import { PrismaWriteService } from '@nestlancer/database';
import { ConfigService } from '@nestjs/config';
import { MetricsService } from '@nestlancer/metrics';

const mockMetricsService = {
  createGauge: jest.fn(),
  createCounter: jest.fn(),
  setGauge: jest.fn(),
  incrementCounter: jest.fn(),
};

describe('StaleEventMonitorService', () => {
  let provider: StaleEventMonitorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaleEventMonitorService,
        {
          provide: PrismaWriteService,
          useValue: {
            outbox: {
              count: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(60) },
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    provider = module.get<StaleEventMonitorService>(StaleEventMonitorService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
