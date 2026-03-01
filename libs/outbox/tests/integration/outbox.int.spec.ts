import { Test, TestingModule } from '@nestjs/testing';
import { OutboxService } from '../../src/outbox.service';
import { OutboxRepository } from '../../src/outbox.repository';
import { OutboxPollerService } from '../../src/outbox-poller.service';
import { PrismaWriteService } from '@nestlancer/database';
import { QueuePublisherService } from '@nestlancer/queue';
import { setupTestDatabase, teardownTestDatabase, resetTestDatabase, setupTestQueue, teardownTestQueue, resetTestQueue } from '@nestlancer/testing';

describe('Outbox System (Integration)', () => {
    let outboxService: OutboxService;
    let repository: OutboxRepository;
    let poller: OutboxPollerService;
    let prisma: PrismaWriteService;
    let publisher: QueuePublisherService;

    const testExchange = 'events';

    beforeAll(async () => {
        process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nestlancer_test';
        process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
        await setupTestDatabase();
        await setupTestQueue();
    });

    afterAll(async () => {
        await teardownTestDatabase();
        await teardownTestQueue();
    });

    beforeEach(async () => {
        await resetTestDatabase();
        await resetTestQueue([testExchange]);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OutboxService,
                OutboxRepository,
                OutboxPollerService,
                {
                    provide: PrismaWriteService,
                    useValue: new PrismaWriteService(),
                },
                {
                    provide: QueuePublisherService,
                    useValue: {
                        onModuleInit: jest.fn(),
                        onModuleDestroy: jest.fn(),
                        publish: jest.fn().mockResolvedValue(undefined),
                    },
                },
            ],
        }).compile();

        outboxService = module.get<OutboxService>(OutboxService);
        repository = module.get<OutboxRepository>(OutboxRepository);
        poller = module.get<OutboxPollerService>(OutboxPollerService);
        prisma = module.get<PrismaWriteService>(PrismaWriteService);
        publisher = module.get<QueuePublisherService>(QueuePublisherService);

        await prisma.onModuleInit();
        // Repository needs prisma instance
        (repository as any).prisma = prisma;
        (poller as any).prisma = prisma;
        (poller as any).publisher = publisher;
    });

    afterEach(async () => {
        await prisma.onModuleDestroy();
    });

    it('should create an outbox event and the poller should process it', async () => {
        const payload = {
            eventType: 'user.created',
            aggregateType: 'user',
            aggregateId: 'user-123',
            payload: { email: 'test@example.com' },
        };

        // 1. Create event
        await outboxService.createEvent(payload as any);

        // 2. Run poller iteration
        await (poller as any).poll();

        // 3. Verify event is marked as published in DB
        const events = await prisma.outboxEvent.findMany();
        expect(events).toHaveLength(1);
        expect(events[0].processedAt).not.toBeNull();
        expect(events[0].eventType).toBe(payload.eventType);

        // 4. Verify publisher was called
        expect(publisher.publish).toHaveBeenCalledWith(
            testExchange,
            payload.eventType,
            expect.objectContaining({
                eventType: payload.eventType,
                aggregateId: payload.aggregateId,
            })
        );
    });

    it('should handle multiple events in order', async () => {
        await outboxService.createEvent({ eventType: 'event.1', aggregateType: 'test', aggregateId: '1', payload: {} } as any);
        await outboxService.createEvent({ eventType: 'event.2', aggregateType: 'test', aggregateId: '2', payload: {} } as any);

        await (poller as any).poll();

        const events = await prisma.outboxEvent.findMany({ orderBy: { createdAt: 'asc' } });
        expect(events).toHaveLength(2);
        expect(events[0].processedAt).not.toBeNull();
        expect(events[1].processedAt).not.toBeNull();
        expect(publisher.publish).toHaveBeenCalledTimes(2);
    });
});
