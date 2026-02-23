import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database/prisma/prisma-write.service';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { MessageReactionDto } from '../dto/message-reaction.dto';

@Injectable()
export class MessageReactionsService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async toggleReaction(userId: string, messageId: string, dto: MessageReactionDto) {
        const message = await this.prismaRead.message.findUnique({ where: { id: messageId } });
        if (!message) throw new NotFoundException('Message not found');

        let reactions: any[] = Array.isArray(message.reactions) ? message.reactions : [];

        // Toggle logic: if reaction exists by user, remove it, else add it
        const existingIndex = reactions.findIndex(r => r.userId === userId && r.emoji === dto.emoji);

        if (existingIndex > -1) {
            reactions.splice(existingIndex, 1);
        } else {
            reactions.push({ userId, emoji: dto.emoji, createdAt: new Date() });
        }

        const updated = await this.prismaWrite.message.update({
            where: { id: messageId },
            data: { reactions },
        });

        return updated.reactions;
    }
}
