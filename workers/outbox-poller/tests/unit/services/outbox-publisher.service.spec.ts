import { Test, TestingModule } from '@nestjs/testing';
import { OutboxPublisherService } from '../../../src/services/outbox-publisher.service';
import { QueuePublisherService } from '@nestlancer/queue';
import { Logger } from '@nestjs/common';
import { OutboxEvent } from '../../../src/interfaces/outbox-event.interface';

describe('OutboxPublisherService', () => {
    let service: OutboxPublisherService;
    let queuePublisher: jest.Mocked<QueuePublisherService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OutboxPublisherService,
                {
                    provide: QueuePublisherService,
                    useValue: { publish: jest.fn() },
                },
            ],
        }).compile();

        service = module.get<OutboxPublisherService>(OutboxPublisherService);
        queuePublisher = module.get(QueuePublisherService);

        jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('publish', () => {
        it('should correctly map eventType to exchange and routing key', async () => {
            const event: OutboxEvent = {
                id: 'evt-1',
                eventType: 'payment.success',
                payload: { test: true },
                aggregateId: 'agg-1',
                aggregateType: 'Payment',
                createdAt: new Date('2023-01-01T00:00:00.000Z'),
            };

            await service.publish(event);

            expect(queuePublisher.publish).toHaveBeenCalledWith(
                'nestlancer.payments',
                'payment.success',
                { test: true },
                {
                    messageId: 'evt-1',
                    timestamp: expect.any(Number),
                    persistent: true,
                }
            );
        });

        it('should map notifications to notifications exchange', async () => {
            const event = { id: 'evt-2', eventType: 'notification.created', payload: {}, createdAt: new Date() } as OutboxEvent;
            await service.publish(event);
            expect(queuePublisher.publish).toHaveBeenCalledWith('nestlancer.notifications', expect.any(String), expect.any(Object), expect.any(Object));
        });

        it('should map unmapped event types to default events exchange', async () => {
            const event = { id: 'evt-3', eventType: 'custom.event', payload: {}, createdAt: new Date() } as OutboxEvent;
            await service.publish(event);
            expect(queuePublisher.publish).toHaveBeenCalledWith('nestlancer.events', expect.any(String), expect.any(Object), expect.any(Object));
        });
    });
});
