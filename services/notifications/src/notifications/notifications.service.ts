import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService, ReadOnly } from '@nestlancer/database';
import { QueryNotificationsDto } from '../dto/query-notifications.dto';
import { buildPrismaSkipTake, createPaginationMeta, ResourceNotFoundException } from '@nestlancer/common';

@Injectable()
export class NotificationsService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    @ReadOnly()
    async findByUser(userId: string, query: QueryNotificationsDto) {
        const { skip, take } = buildPrismaSkipTake(query.page, query.limit);

        const where: any = {
            userId,
        };

        if (query.type) {
            where.type = query.type;
        }

        if (query.unreadOnly) {
            where.readAt = null;
        }

        const [items, total] = await Promise.all([
            this.prismaRead.notification.findMany({
                where,
                skip,
                take,
                orderBy: query.sort ? { [query.sort.split(':')[0]]: query.sort.split(':')[1] || 'desc' } : { createdAt: 'desc' },
            }),
            this.prismaRead.notification.count({ where }),
        ]);

        return {
            data: items,
            pagination: createPaginationMeta(query.page, query.limit, total),
        };
    }

    @ReadOnly()
    async getHistory(userId: string, query: QueryNotificationsDto) {
        const { skip, take } = buildPrismaSkipTake(query.page, query.limit);

        const where: any = { userId };
        if (query.type) {
            where.type = query.type;
        }

        const [items, total] = await Promise.all([
            this.prismaRead.notification.findMany({
                where,
                skip,
                take,
                orderBy: query.sort ? { [query.sort.split(':')[0]]: query.sort.split(':')[1] || 'desc' } : { createdAt: 'desc' },
            }),
            this.prismaRead.notification.count({ where }),
        ]);

        return {
            data: items,
            pagination: createPaginationMeta(query.page, query.limit, total),
        };
    }

    @ReadOnly()
    async getUnreadCount(userId: string) {
        const count = await this.prismaRead.notification.count({
            where: {
                userId,
                readAt: null,
            },
        });

        return { count };
    }

    async findByIdAndUser(id: string, userId: string) {
        const notification = await this.prismaWrite.notification.findFirst({
            where: { id, userId },
        });

        if (!notification) {
            throw new ResourceNotFoundException('Notification', id);
        }

        if (!notification.readAt) {
            return this.markRead(id, userId, true);
        }

        return notification;
    }

    async markRead(id: string, userId: string, read: boolean) {
        const notification = await this.prismaWrite.notification.findFirst({
            where: { id, userId },
        });

        if (!notification) {
            throw new ResourceNotFoundException('Notification', id);
        }

        return this.prismaWrite.notification.update({
            where: { id },
            data: { readAt: read ? new Date() : null },
        });
    }

    async markAllRead(userId: string) {
        return this.prismaWrite.notification.updateMany({
            where: { userId, readAt: null },
            data: { readAt: new Date() },
        });
    }

    async markSelectedRead(userId: string, notificationIds: string[]) {
        return this.prismaWrite.notification.updateMany({
            where: {
                id: { in: notificationIds },
                userId,
            },
            data: { readAt: new Date() },
        });
    }

    async clearRead(userId: string) {
        return this.prismaWrite.notification.deleteMany({
            where: { userId, readAt: { not: null } },
        });
    }

    async softDelete(id: string, userId: string) {
        return this.prismaWrite.notification.deleteMany({
            where: { id, userId },
        });
    }

    async sendTestNotification(userId: string) {
        await this.prismaWrite.notification.create({
            data: {
                userId,
                type: 'test',
                title: 'Test notification',
                message: 'This is a test notification.',
            },
        });
        return { sent: true };
    }
}
