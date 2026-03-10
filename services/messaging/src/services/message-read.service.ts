import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';

@Injectable()
export class MessageReadService {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async markAsRead(userId: string, messageId: string) {
    const message = await this.prismaRead.message.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');

    let readBy: any[] = Array.isArray(message.readBy) ? message.readBy : [];

    // Check if already read
    if (!readBy.find((r) => r.userId === userId)) {
      readBy.push({ userId, readAt: new Date() });

      await this.prismaWrite.message.update({
        where: { id: messageId },
        data: { readBy },
      });
    }

    return { success: true };
  }

  async markProjectMessagesAsRead(userId: string, projectId: string) {
    const unreadMessages = await this.prismaRead.message.findMany({
      where: {
        projectId,
        NOT: { senderId: userId },
      },
    });

    const toUpdate = unreadMessages.filter((msg) => {
      const readBy: any[] = Array.isArray(msg.readBy) ? msg.readBy : [];
      return !readBy.find((r) => r.userId === userId);
    });

    if (toUpdate.length === 0) return { success: true };

    await this.prismaWrite.$transaction(
      toUpdate.map((msg) => {
        const readBy: any[] = Array.isArray(msg.readBy) ? msg.readBy : [];
        readBy.push({ userId, readAt: new Date() });
        return this.prismaWrite.message.update({
          where: { id: msg.id },
          data: { readBy },
        });
      }),
    );

    return { success: true, updatedCount: toUpdate.length };
  }
}
