import { Test, TestingModule } from '@nestjs/testing';
import { OutboxPollerService } from '../../../src/services/outbox-poller.service';
import { PrismaWriteService } from '@nestlancer/database';
import { LeaderElectionService } from '../../../src/services/leader-election.service';
import { OutboxPublisherService } from '../../../src/services/outbox-publisher.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { OutboxEventStatus } from '../../../src/interfaces/outbox-event.interface';

describe('OutboxPollerService', () => {
    let service: OutboxPollerService;
    let prismaWrite: jest.Mocked<PrismaWriteService>;
    let leaderElection: jest.Mocked<LeaderElectionService>;
    let publisher: jest.Mocked<OutboxPublisherService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OutboxPollerService,
                {
                    provide: PrismaWriteService,
                    useValue: {
                        outboxEvent: {
                            findMany: jest.fn(),
                            update: jest.fn(),
                        },
                    },
                },
                {
                    provide: LeaderElectionService,
                    useValue: { acquireLock: jest.fn() },
                },
                {
                    provide: OutboxPublisherService,
                    useValue: { publish: jest.fn() },
                },
                {
                    provide: ConfigService,
                    useValue: { get: jest.fn().mockReturnValue(100) },
                },
            ],
        }).compile();

        service = module.get<OutboxPollerService>(OutboxPollerService);
        prismaWrite = module.get(PrismaWriteService);
        leaderElection = module.get(LeaderElectionService);
        publisher = module.get(OutboxPublisherService);

        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('poll', () => {
        it('should do nothing if already processing', async () => {
            (service as any).isProcessing = true;
            await service.poll();
            expect(leaderElection.acquireLock).not.toHaveBeenCalled();
        });

        it('should do nothing if not leader', async () => {
            leaderElection.acquireLock.mockResolvedValue(false);
            await service.poll();
            expect(prismaWrite.outboxEvent.findMany).not.toHaveBeenCalled();
        });

        it('should process batch when leader', async () => {
            leaderElection.acquireLock.mockResolvedValue(true);
            const mockEvents = [
                { id: '1', eventType: 'user.created', payload: {} },
                { id: '2', eventType: 'payment.success', payload: {} },
            ];
            prismaWrite.outboxEvent.findMany.mockResolvedValue(mockEvents as any);
            publisher.publish.mockResolvedValue();

            await service.poll();

            expect(prismaWrite.outboxEvent.findMany).toHaveBeenCalledWith({
                where: { status: OutboxEventStatus.PENDING },
                orderBy: { createdAt: 'asc' },
                take: 100,
            });

            expect(publisher.publish).toHaveBeenCalledTimes(2);
            expect(publisher.publish).toHaveBeenCalledWith(mockEvents[0]);
            expect(publisher.publish).toHaveBeenCalledWith(mockEvents[1]);

            expect(prismaWrite.outboxEvent.update).toHaveBeenCalledTimes(2);
            expect(prismaWrite.outboxEvent.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: expect.objectContaining({ status: OutboxEventStatus.PUBLISHED }),
            });
        });

        it('should handle publisher failure and update retries', async () => {
            leaderElection.acquireLock.mockResolvedValue(true);
            const mockEvent = { id: '1', eventType: 'user.created', payload: {}, retries: 0 };
            prismaWrite.outboxEvent.findMany.mockResolvedValue([mockEvent] as any);

            publisher.publish.mockRejectedValue(new Error('Publish Failed'));

            await service.poll();

            expect(prismaWrite.outboxEvent.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: {
                    retries: { increment: 1 },
                    error: 'Publish Failed',
                    status: OutboxEventStatus.PENDING,
                },
            });
        });

        it('should mark as FAILED after 5 retries', async () => {
            leaderElection.acquireLock.mockResolvedValue(true);
            const mockEvent = { id: '1', eventType: 'user.created', payload: {}, retries: 5 };
            prismaWrite.outboxEvent.findMany.mockResolvedValue([mockEvent] as any);

            publisher.publish.mockRejectedValue(new Error('Publish Failed'));

            await service.poll();

            expect(prismaWrite.outboxEvent.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: {
                    retries: { increment: 1 },
                    error: 'Publish Failed',
                    status: OutboxEventStatus.FAILED,
                },
            });
        });

        it('should handle general errors safely resetting isProcessing', async () => {
            leaderElection.acquireLock.mockResolvedValue(true);
            prismaWrite.outboxEvent.findMany.mockRejectedValue(new Error('DB connection lost'));

            await service.poll();

            expect((service as any).isProcessing).toBe(false);
        });
    });
});
