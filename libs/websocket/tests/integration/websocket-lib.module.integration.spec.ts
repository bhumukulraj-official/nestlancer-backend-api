import { Test, TestingModule } from '@nestjs/testing';
import { WebSocketLibModule } from '../../src/websocket-lib.module';
import { WsAuthGuard } from '../../src/guards/ws-auth.guard';
import { WsThrottleGuard } from '../../src/guards/ws-throttle.guard';
import { ConfigModule } from '@nestjs/config';

describe('WebSocketLibModule (Integration)', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
        WebSocketLibModule,
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

  it('should have websocket guards registered', () => {
    const wsAuthGuard = module.get<WsAuthGuard>(WsAuthGuard);
    const wsThrottleGuard = module.get<WsThrottleGuard>(WsThrottleGuard);

    expect(wsAuthGuard).toBeDefined();
    expect(wsThrottleGuard).toBeDefined();
  });
});
