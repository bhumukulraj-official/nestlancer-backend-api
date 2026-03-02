import { Test, TestingModule } from '@nestjs/testing';
import { MiddlewareModule } from '../../src/middleware.module';
import { ThrottleGuard } from '../../src/guards/throttle.guard';
import { MaintenanceGuard } from '../../src/guards/maintenance.guard';
import { ConfigModule } from '@nestjs/config';

describe('MiddlewareModule (Integration)', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
        MiddlewareModule,
      ],
    }).compile();
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have guards registered', () => {
    const throttleGuard = module.get<ThrottleGuard>(ThrottleGuard);
    const maintenanceGuard = module.get<MaintenanceGuard>(MaintenanceGuard);

    expect(throttleGuard).toBeDefined();
    expect(maintenanceGuard).toBeDefined();
  });
});
