import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PushPayload } from '../interfaces/push-payload.interface';

@Injectable()
export class PushProviderService implements OnModuleInit {
    private readonly logger = new Logger(PushProviderService.name);

    constructor(private readonly configService: ConfigService) { }

    onModuleInit() {
        const publicKey = this.configService.get<string>('notification-worker.vapid.publicKey');
        const privateKey = this.configService.get<string>('notification-worker.vapid.privateKey');
        const subject = this.configService.get<string>('notification-worker.vapid.subject');

        if (publicKey && privateKey && subject) {
            webpush.setVapidDetails(subject, publicKey, privateKey);
            this.logger.log('VAPID details set for Web Push');
        } else {
            this.logger.warn('VAPID details missing. Web Push will not work.');
        }
    }

    async sendNotification(subscription: any, payload: PushPayload): Promise<boolean> {
        try {
            await webpush.sendNotification(subscription, JSON.stringify(payload));
            return true;
        } catch (error: any) {
            if (error.statusCode === 410 || error.statusCode === 404) {
                this.logger.warn(`Push subscription expired or invalid (HTTP ${error.statusCode})`);
                // Signal to caller that subscription should be removed
                return false;
            }
            this.logger.error('Failed to send push notification:', error);
            throw error;
        }
    }
}
