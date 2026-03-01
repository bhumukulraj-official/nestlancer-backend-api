import { Test, TestingModule } from '@nestjs/testing';
import { QueuePublisherService } from '../../src/queue-publisher.service';
import { QueueConsumerService } from '../../src/queue-consumer.service';
import { setupTestQueue, teardownTestQueue, resetTestQueue } from '@nestlancer/testing';

describe('Queue Services (Integration)', () => {
    let publisher: QueuePublisherService;
    let consumer: QueueConsumerService;

    const testExchange = 'test.exchange';
    const testQueue = 'test.queue';
    const testRoutingKey = 'test.key';

    beforeAll(async () => {
        process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
        await setupTestQueue();
    });

    afterAll(async () => {
        await teardownTestQueue();
    });

    beforeEach(async () => {
        await resetTestQueue([testExchange], [testQueue]);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QueuePublisherService,
                QueueConsumerService,
                {
                    provide: 'QUEUE_OPTIONS',
                    useValue: { url: process.env.RABBITMQ_URL },
                },
            ],
        }).compile();

        publisher = module.get<QueuePublisherService>(QueuePublisherService);
        consumer = module.get<QueueConsumerService>(QueueConsumerService);

        await publisher.onModuleInit();
        await consumer.onModuleInit();
    });

    afterEach(async () => {
        await publisher.onModuleDestroy();
        // Consumer doesn't have onModuleDestroy in current impl but good practice
    });

    it('should publish and consume a message', async () => {
        const payload = { message: 'Hello RabbitMQ', timestamp: Date.now() };
        let receivedPayload: any = null;

        const channel = consumer.getChannel();
        await channel.assertExchange(testExchange, 'topic', { durable: true });
        await channel.assertQueue(testQueue, { durable: true });
        await channel.bindQueue(testQueue, testExchange, testRoutingKey);

        await consumer.consume(testQueue, async (msg) => {
            receivedPayload = JSON.parse(msg.content.toString());
        });

        await publisher.publish(testExchange, testRoutingKey, payload);

        // Wait for message to be processed
        await new Promise((resolve) => {
            const check = setInterval(() => {
                if (receivedPayload) {
                    clearInterval(check);
                    resolve(null);
                }
            }, 100);
            setTimeout(() => {
                clearInterval(check);
                resolve(null);
            }, 5000); // 5s timeout
        });

        expect(receivedPayload).toEqual(payload);
    });

    it('should send directly to queue and consume', async () => {
        const payload = { direct: true };
        let receivedPayload: any = null;

        await consumer.getChannel().assertQueue(testQueue, { durable: true });

        await consumer.consume(testQueue, async (msg) => {
            receivedPayload = JSON.parse(msg.content.toString());
        });

        await publisher.sendToQueue(testQueue, payload);

        await new Promise((resolve) => {
            const check = setInterval(() => {
                if (receivedPayload) {
                    clearInterval(check);
                    resolve(null);
                }
            }, 100);
            setTimeout(() => {
                clearInterval(check);
                resolve(null);
            }, 5000);
        });

        expect(receivedPayload).toEqual(payload);
    });
});
