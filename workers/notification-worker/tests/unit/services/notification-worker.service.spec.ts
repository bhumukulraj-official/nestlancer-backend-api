import { Test, TestingModule } from '@nestjs/testing';
import { NotificationWorkerService } from '../../../src/services/notification-worker.service';
import { InAppNotificationProcessor } from '../../../src/processors/in-app-notification.processor';
import { PushProviderService } from '../../../src/services/push-provider.service';
import { PrismaWriteService } from '@nestlancer/database';
import { Logger } from '@nestjs/common';
import { NotificationJob, NotificationChannel } from '../../../src/interfaces/notification-job.interface';

describe('NotificationWorkerService', () => {
    let service: NotificationWorkerService;
    let inAppProcessor: jest.Mocked<InAppNotificationProcessor>;
    let pushProvider: jest.Mocked<PushProviderService>;
    let prismaWrite: jest.Mocked<PrismaWriteService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationWorkerService,
                {
                    provide: InAppNotificationProcessor,
                    useValue: { process: jest.fn() },
                },
                {
                    provide: PushProviderService,
                    useValue: { sendNotification: jest.fn() },
                },
                {
                    provide: PrismaWriteService,
                    useValue: {
                        userPushSubscription: { findMany: jest.fn(), delete: jest.fn() }
                    },
                },
            ],
        }).compile();

        service = module.get<NotificationWorkerService>(NotificationWorkerService);
        inAppProcessor = module.get(InAppNotificationProcessor);
        pushProvider = module.get(PushProviderService);
        prismaWrite = module.get(PrismaWriteService);

        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('processNotification', () => {
        it('should process IN_APP notification', async () => {
            inAppProcessor.process.mockResolvedValue();
            const job: NotificationJob = { userId: 'u1', type: 'TEST', notification: {} as any, channels: [NotificationChannel.IN_APP] };

            await service.processNotification(job);
            expect(inAppProcessor.process).toHaveBeenCalledWith(job);
        });

        it('should process PUSH notification and remove invalid subscriptions', async () => {
            const mockSubscriptions = [
                { id: 'sub1', subscription: { endpoint: 'url1' } },
                { id: 'sub2', subscription: { endpoint: 'url2' } },
            ];
            prismaWrite.userPushSubscription.findMany.mockResolvedValue(mockSubscriptions as any);

            pushProvider.sendNotification
                .mockResolvedValueOnce(true) // sub1 success
                .mockResolvedValueOnce(false); // sub2 failed (invalid)

            const job: NotificationJob = {
                userId: 'u1', type: 'TEST',
                notification: { title: 'T', message: 'M', actionUrl: '/url' } as any,
                channels: [NotificationChannel.PUSH]
            };

            await service.processNotification(job);

            expect(prismaWrite.userPushSubscription.findMany).toHaveBeenCalledWith({ where: { userId: 'u1' } });

            expect(pushProvider.sendNotification).toHaveBeenCalledTimes(2);
            expect(pushProvider.sendNotification).toHaveBeenCalledWith({ endpoint: 'url1' }, { title: 'T', body: 'M', data: { url: '/url', type: 'TEST' } });

            // sub2 should be deleted
            expect(prismaWrite.userPushSubscription.delete).toHaveBeenCalledWith({ where: { id: 'sub2' } });
        });

        it('should handle unconfigured channels gracefully', async () => {
            const job: NotificationJob = { userId: 'u1', type: 'TEST', notification: {} as any, channels: ['EMAIL' as any] };
            await service.processNotification(job);
            // Just verifying it doesn't crash
        });

        it('should handle no push subscriptions gracefully', async () => {
            prismaWrite.userPushSubscription.findMany.mockResolvedValue([]);
            const job: NotificationJob = { userId: 'u1', type: 'TEST', notification: {} as any, channels: [NotificationChannel.PUSH] };
            await service.processNotification(job);
            expect(pushProvider.sendNotification).not.toHaveBeenCalled();
        });
    });
});
