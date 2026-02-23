import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '@nestlancer/database';
import { SegmentNotificationDto } from '../dto/segment-notification.dto';
import { NotificationsAdminService } from './notifications-admin.service';

@Injectable()
export class NotificationSegmentService {
    constructor(
        private readonly prismaRead: PrismaReadService,
        private readonly adminService: NotificationsAdminService,
    ) { }

    async sendToSegment(dto: SegmentNotificationDto) {
        let users = await this.prismaRead.user.findMany({
            select: { id: true },
        });

        if (dto.criteria.role) {
            users = users.filter((u: any) => u.role === dto.criteria.role);
        }

        const userIds = users.map(u => u.id);

        if (userIds.length > 0) {
            await this.adminService.sendTargeted({
                recipientIds: userIds,
                title: dto.notificationPayload.title,
                message: dto.notificationPayload.message,
                type: dto.notificationPayload.type,
            });
        }

        return { segmentedUsersCount: userIds.length };
    }
}
