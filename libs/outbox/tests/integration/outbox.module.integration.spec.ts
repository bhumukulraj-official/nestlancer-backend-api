import { Test, TestingModule } from '@nestjs/testing';
import { OutboxModule } from '../../src/outbox.module';
import { OutboxService } from '../../src/outbox.service';
import { OutboxRepository } from '../../src/outbox.repository';
import { ConfigModule } from '@nestjs/config';

describe('OutboxModule (Integration)', () => {
  let module: TestingModule;
  let service: OutboxService;
  let repository: OutboxRepository;

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
        OutboxModule.forRoot(),
      ],
    })
      .overrideProvider(OutboxRepository)
      .useValue({
        create: jest.fn().mockResolvedValue('event-123'),
      })
      .compile();

    service = module.get<OutboxService>(OutboxService);
    repository = module.get<OutboxRepository>(OutboxRepository);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an outbox event', async () => {
    const event = {
      eventType: 'USER_CREATED',
      aggregateType: 'USER',
      aggregateId: 'user-1',
      payload: { email: 'test@example.com' },
    };

    const id = await service.createEvent(event as any);

    expect(id).toBe('event-123');
    expect(repository.create).toHaveBeenCalledWith(event, undefined);
  });
});
