import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService, ReadOnly } from '@nestlancer/database';
import { QueryNotificationsDto } from '../dto/query-notifications.dto';
import { buildPrismaSkipTake, createPaginationMeta } from '@nestlancer/common/utils/pagination.util';
import { ResourceNotFoundException } from '@nestlancer/common/exceptions/not-found.exception';

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
            dismissedAt: null,
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
                orderBy: { [query.sortBy || 'createdAt']: query.order || 'desc' },
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
                orderBy: { [query.sortBy || 'createdAt']: query.order || 'desc' },
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
                dismissedAt: null,
            },
        });

        return { count };
    }

    async findByIdAndUser(id: string, userId: string) {
        const notification = await this.prismaWrite.notification.findFirst({
            where: { id, userId, dismissedAt: null },
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
            where: { id, userId, dismissedAt: null },
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
            where: { userId, readAt: null, dismissedAt: null },
            data: { readAt: new Date() },
        });
    }

    async markSelectedRead(userId: string, notificationIds: string[]) {
        return this.prismaWrite.notification.updateMany({
            where: {
                id: { in: notificationIds },
                userId,
                dismissedAt: null,
            },
            data: { readAt: new Date() },
        });
    }

    async clearRead(userId: string) {
        return this.prismaWrite.notification.updateMany({
            where: { userId, readAt: { not: null }, dismissedAt: null },
            data: { dismissedAt: new Date() },
        });
    }

    async softDelete(id: string, userId: string) {
        return this.prismaWrite.notification.updateMany({
            where: { id, userId },
            data: { dismissedAt: new Date() },
        });
    }
}
