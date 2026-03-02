import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { OutboxService } from '@nestlancer/outbox';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';

@Injectable()
export class MessagingService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly outbox: OutboxService,
    ) { }

    async sendMessage(userId: string, dto: CreateMessageDto) {
        if (!dto.content && dto.type === 'TEXT') {
            throw new BadRequestException('Content is required for text messages');
        }

        const message = await this.prismaWrite.$transaction(async (tx: any) => {
            const msg = await tx.message.create({
                data: {
                    projectId: dto.projectId,
                    senderId: userId,
                    content: dto.content,
                    replyToId: dto.replyToId,
                    type: dto.type,
                    readBy: [{ userId, readAt: new Date() }], // Sender has read it
                },
            });

            await tx.outbox.create({
                data: {
                    eventType: 'MESSAGE_SENT',
                    payload: {
                        messageId: msg.id,
                        projectId: msg.projectId,
                        senderId: msg.senderId,
                        replyToId: msg.replyToId,
                    },
                },
            });

            return msg;
        });

        return message;
    }

    async getMessages(projectId: string, query: { page?: number; limit?: number }) {
        const page = query.page || 1;
        const limit = query.limit || 50;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.prismaRead.message.findMany({
                where: { projectId, replyToId: null, deletedAt: null },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: { sender: { select: { id: true, profile: true } } }
            }),
            this.prismaRead.message.count({
                where: { projectId, replyToId: null, deletedAt: null },
            }),
        ]);

        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async updateMessage(userId: string, id: string, dto: UpdateMessageDto) {
        const message = await this.prismaRead.message.findUnique({ where: { id } });
        if (!message) throw new NotFoundException('Message not found');
        if (message.senderId !== userId) throw new BadRequestException('You can only edit your own messages');
        if (message.deletedAt) throw new BadRequestException('Cannot edit a deleted message');

        return this.prismaWrite.message.update({
            where: { id },
            data: { content: dto.content, editedAt: new Date() },
        });
    }

    async deleteMessage(userId: string, id: string) {
        const message = await this.prismaRead.message.findUnique({ where: { id } });
        if (!message) throw new NotFoundException('Message not found');
        if (message.senderId !== userId) throw new BadRequestException('You can only delete your own messages');

        return this.prismaWrite.message.update({
            where: { id },
            data: { deletedAt: new Date(), content: null }, // Hard/soft delete logic
        });
    }
}
