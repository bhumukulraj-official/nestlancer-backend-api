import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from '../../src/logger.module';
import { NestlancerLoggerService } from '../../src/logger.service';
import { ConfigModule } from '@nestjs/config';

describe('LoggerModule (Integration)', () => {
  let module: TestingModule;
  let service: NestlancerLoggerService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
        LoggerModule.forRoot({ level: 'debug' }),
      ],
    }).compile();

    service = module.get<NestlancerLoggerService>(NestlancerLoggerService);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log messages without crashing', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    service.log('Test message', 'TestContext');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
