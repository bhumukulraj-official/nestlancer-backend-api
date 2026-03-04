import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsAdminService } from '../../../src/notifications/notifications-admin.service';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { QueryNotificationsDto } from '../../../src/dto/query-notifications.dto';
import { SendNotificationDto } from '../../../src/dto/send-notification.dto';

describe('NotificationsAdminService', () => {
    let service: NotificationsAdminService;
    let prismaWrite: jest.Mocked<PrismaWriteService>;
    let prismaRead: jest.Mocked<PrismaReadService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationsAdminService,
                {
                    provide: PrismaWriteService,
                    useValue: {
                        notification: { createMany: jest.fn(), deleteMany: jest.fn() },
                    },
                },
                {
                    provide: PrismaReadService,
                    useValue: {
                        notification: { findMany: jest.fn(), count: jest.fn() },
                        notificationDeliveryLog: { findMany: jest.fn() },
                    },
                },
            ],
        }).compile();

        service = module.get<NotificationsAdminService>(NotificationsAdminService);
        prismaWrite = module.get(PrismaWriteService);
        prismaRead = module.get(PrismaReadService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return paginated notifications', async () => {
            prismaRead.notification.findMany.mockResolvedValue([{ id: '1' }] as any);
            prismaRead.notification.count.mockResolvedValue(1);

            const query: QueryNotificationsDto = { page: 1, limit: 10, type: 'alert' };
            const result = await service.findAll(query);

            expect(prismaRead.notification.findMany).toHaveBeenCalledWith({
                where: { type: 'alert' },
                skip: 0,
                take: 10,
                orderBy: { createdAt: 'desc' },
            });
            expect(result.data).toHaveLength(1);
            expect(result.pagination.totalItems).toBe(1);
        });

        it('should handle sorting', async () => {
            prismaRead.notification.findMany.mockResolvedValue([]);
            prismaRead.notification.count.mockResolvedValue(0);

            const query: QueryNotificationsDto = { page: 1, limit: 10, sort: 'status:desc' };
            await service.findAll(query);

            expect(prismaRead.notification.findMany).toHaveBeenCalledWith(expect.objectContaining({
                orderBy: { status: 'desc' },
            }));
        });
    });

    describe('getStats', () => {
        it('should return notification stats', async () => {
            prismaRead.notification.count
                .mockResolvedValueOnce(100) // totalCount line 41
                .mockResolvedValueOnce(20); // unreadCount line 42

            const result = await service.getStats();

            expect(result).toEqual({ totalCount: 100, unreadCount: 20 });
        });
    });

    describe('getDeliveryReport', () => {
        it('should return delivery logs for notification', async () => {
            prismaRead.notificationDeliveryLog.findMany.mockResolvedValue([{ id: '1' }] as any);

            const result = await service.getDeliveryReport('notif1');

            expect(prismaRead.notificationDeliveryLog.findMany).toHaveBeenCalledWith({
                where: { notificationId: 'notif1' },
            });
            expect(result).toEqual([{ id: '1' }]);
        });
    });

    describe('sendTargeted', () => {
        it('should create notifications for selected recipients', async () => {
            prismaWrite.notification.createMany.mockResolvedValue({ count: 2 } as any);

            const dto: SendNotificationDto = {
                recipientIds: ['user1', 'user2'],
                title: 'msg',
                message: 'hello',
                type: 'sys',
                channels: ['IN_APP'],
            };

            const result = await service.sendTargeted(dto);

            expect(prismaWrite.notification.createMany).toHaveBeenCalledWith({
                data: [
                    { userId: 'user1', title: 'msg', message: 'hello', type: 'sys', channels: ['IN_APP'], scheduledFor: null },
                    { userId: 'user2', title: 'msg', message: 'hello', type: 'sys', channels: ['IN_APP'], scheduledFor: null },
                ],
            });
            expect(result).toEqual({ queued: 2 });
        });
    });

    describe('clearUserNotifications', () => {
        it('should delete notifications for user', async () => {
            prismaWrite.notification.deleteMany.mockResolvedValue({ count: 5 } as any);

            await service.clearUserNotifications('user1');

            expect(prismaWrite.notification.deleteMany).toHaveBeenCalledWith({
                where: { userId: 'user1' },
            });
        });
    });
});
