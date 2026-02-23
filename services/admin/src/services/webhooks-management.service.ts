import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { CreateWebhookDto } from '../dto/create-webhook.dto';
import { UpdateWebhookDto } from '../dto/update-webhook.dto';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksManagementService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async create(dto: CreateWebhookDto) {
        const secret = dto.secret || crypto.randomBytes(32).toString('hex');

        return this.prismaWrite.webhook.create({
            data: {
                name: dto.name,
                url: dto.url,
                events: dto.events,
                headers: dto.headers || {},
                secret,
                enabled: dto.enabled ?? true,
                retryPolicy: dto.retryPolicy as any,
            },
        });
    }

    async findAll() {
        return this.prismaRead.webhook.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const webhook = await this.prismaRead.webhook.findUnique({ where: { id } });
        if (!webhook) throw new NotFoundException('Webhook not found');
        return webhook;
    }

    async update(id: string, dto: UpdateWebhookDto) {
        await this.findOne(id); // exists
        return this.prismaWrite.webhook.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.url && { url: dto.url }),
                ...(dto.events && { events: dto.events }),
                ...(dto.headers && { headers: dto.headers }),
                ...(dto.secret && { secret: dto.secret }),
                ...(dto.enabled !== undefined && { enabled: dto.enabled }),
                ...(dto.retryPolicy && { retryPolicy: dto.retryPolicy as any }),
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prismaWrite.webhook.delete({ where: { id } });
    }
}
