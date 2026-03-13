import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService, ReadOnly } from '@nestlancer/database';
import { QueryNotificationsDto } from '../dto/query-notifications.dto';
import { SendNotificationDto } from '../dto/send-notification.dto';
import { buildPrismaSkipTake, createPaginationMeta } from '@nestlancer/common';

@Injectable()
export class NotificationsAdminService {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  @ReadOnly()
  async findAll(query: QueryNotificationsDto) {
    const { skip, take } = buildPrismaSkipTake(query.page, query.limit);

    const where: any = {};
    if (query.type) {
      where.type = query.type;
    }

    const [items, total] = await Promise.all([
      this.prismaRead.notification.findMany({
        where,
        skip,
        take,
        orderBy: query.sort
          ? { [query.sort.split(':')[0]]: query.sort.split(':')[1] || 'desc' }
          : { createdAt: 'desc' },
      }),
      this.prismaRead.notification.count({ where }),
    ]);

    return {
      data: items,
      pagination: createPaginationMeta(query.page, query.limit, total),
    };
  }

  @ReadOnly()
  async getStats() {
    const totalCount = await this.prismaRead.notification.count();
    const unreadCount = await this.prismaRead.notification.count({ where: { readAt: null } });

    return {
      totalCount,
      unreadCount,
    };
  }

  @ReadOnly()
  async getDeliveryReport(notificationId: string) {
    // Prefer a concrete client if the delivery log model is available; otherwise
    // fall back to an empty list so the endpoint remains stable even when the
    // underlying schema does not yet expose delivery logs.
    const deliveryLogClient =
      (this.prismaRead as any).notificationDeliveryLog || (this.prismaWrite as any).notificationDeliveryLog;

    if (!deliveryLogClient) {
      return [];
    }

    return deliveryLogClient.findMany({
      where: { notificationId },
    });
  }

  async sendTargeted(dto: SendNotificationDto) {
    const notifications = dto.recipientIds.map((userId) => ({
      userId,
      type: dto.type || 'system.announcement',
      title: dto.title,
      message: dto.message,
      channels: dto.channels || ['IN_APP', 'EMAIL'],
      // The current notifications schema does not expose a dedicated scheduledFor column
      // on the notification record; scheduling is handled via outbox/queue instead.
    }));

    await this.prismaWrite.notification.createMany({
      data: notifications,
    });

    return { queued: notifications.length };
  }

  async clearUserNotifications(userId: string) {
    return this.prismaWrite.notification.deleteMany({
      where: { userId },
    });
  }
}
