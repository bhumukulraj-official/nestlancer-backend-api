import { Injectable, Logger } from '@nestjs/common';
import { QueuePublisherService } from '@nestlancer/queue';
import { BroadcastNotificationDto } from '../dto/broadcast-notification.dto';
import { PrismaWriteService } from '@nestlancer/database';

@Injectable()
export class NotificationBroadcastService {
    private readonly logger = new Logger(NotificationBroadcastService.name);

    constructor(
        private readonly queuePublisher: QueuePublisherService,
        private readonly prismaWrite: PrismaWriteService,
    ) { }

    async broadcast(dto: BroadcastNotificationDto) {
        this.logger.log(`Broadcasting notification: ${dto.title}`);

        // Simplification for the scaffolding: We publish an event and outbox-poller + workers handle the rest.
        await this.queuePublisher.publish('nestlancer.events', 'notification.broadcast', dto);

        return {
            status: 'scheduled',
            accepted: true,
            scheduledFor: dto.scheduledFor,
        };
    }
}
