import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { RegisterPushSubscriptionDto } from '../dto/register-push-subscription.dto';

@Injectable()
export class SubscriptionsService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async register(userId: string, dto: RegisterPushSubscriptionDto) {
        const existing = await this.prismaRead.pushSubscription.findFirst({
            where: { userId, endpoint: dto.endpoint },
        });

        if (existing) {
            return {
                subscriptionId: existing.id,
                active: true,
                registeredAt: existing.createdAt,
            };
        }

        const sub = await this.prismaWrite.pushSubscription.create({
            data: {
                userId,
                endpoint: dto.endpoint,
                p256dhKey: dto.keys.p256dh,
                authKey: dto.keys.auth,
                deviceInfo: dto.deviceInfo ? JSON.parse(dto.deviceInfo) : {},
            }
        });

        return {
            subscriptionId: sub.id,
            active: true,
            registeredAt: sub.createdAt,
        };
    }

    async unregister(userId: string, endpoint: string) {
        await this.prismaWrite.pushSubscription.deleteMany({
            where: { userId, endpoint },
        });

        return { success: true };
    }
}
