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
    return this.prismaRead.notificationDeliveryLog.findMany({
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
      scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
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
