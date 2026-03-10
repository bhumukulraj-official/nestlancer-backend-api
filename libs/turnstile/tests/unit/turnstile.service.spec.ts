import { Test, TestingModule } from '@nestjs/testing';
import { TurnstileService } from '../../src/turnstile.service';

describe('TurnstileService', () => {
  let service: TurnstileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'TURNSTILE_OPTIONS',
          useValue: { secretKey: 'test-secret' },
        },
        TurnstileService,
      ],
    }).compile();

    service = module.get<TurnstileService>(TurnstileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return success true in test environment', async () => {
    process.env.NODE_ENV = 'test';
    const result = await service.verify('test-token');
    expect(result.success).toBe(true);
  });

  it('should handle verification failure', async () => {
    process.env.NODE_ENV = 'production';
    // Mock global fetch
    global.fetch = jest.fn().mockResolvedValue({
      json: jest
        .fn()
        .mockResolvedValue({ success: false, 'error-codes': ['invalid-input-response'] }),
    });

    const result = await service.verify('invalid-token');
    expect(result.success).toBe(false);

    (global.fetch as jest.Mock).mockRestore();
    process.env.NODE_ENV = 'test';
  });
});
