import { Test, TestingModule } from '@nestjs/testing';
import { AuthLibModule } from '../../src/auth-lib.module';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';
import { JwtStrategy } from '../../src/strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';

describe('AuthLibModule (Integration)', () => {
  let module: TestingModule;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgres://localhost:5432/db';
    process.env.REDIS_CACHE_URL = 'redis://localhost:6379';
    process.env.RABBITMQ_URL = 'amqp://localhost';
    process.env.JWT_ACCESS_SECRET = 'secret1234567890';
    process.env.JWT_REFRESH_SECRET = 'secret1234567890';

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
        AuthLibModule,
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

  it('should have JwtAuthGuard and JwtStrategy registered', () => {
    const guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    const strategy = module.get<JwtStrategy>(JwtStrategy);

    expect(guard).toBeDefined();
    expect(strategy).toBeDefined();
  });
});
