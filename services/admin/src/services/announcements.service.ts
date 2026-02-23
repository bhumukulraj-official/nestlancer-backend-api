import { Injectable } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database';
import { QueueProducerService } from '@nestlancer/queue';
import { SendAnnouncementDto } from '../dto/send-announcement.dto';

@Injectable()
export class AnnouncementsService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly queueService: QueueProducerService,
    ) { }

    async send(dto: SendAnnouncementDto, adminId: string) {
        const announcement = await this.prismaWrite.announcement.create({
            data: {
                title: dto.title,
                message: dto.message,
                type: dto.type,
                dismissable: dto.dismissable ?? true,
                scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
                createdBy: adminId,
            },
        });

        if (!dto.scheduledFor) {
            // Broadcast immediately via Websockets/PubSub
            await this.queueService.publish('notifications', 'BROADCAST_ANNOUNCEMENT', {
                announcementId: announcement.id,
                payload: announcement,
            });

            await this.prismaWrite.announcement.update({
                where: { id: announcement.id },
                data: { sentAt: new Date() }
            });
        }

        return announcement;
    }
}
