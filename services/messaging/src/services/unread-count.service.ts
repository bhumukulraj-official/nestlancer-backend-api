import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';

@Injectable()
export class UnreadCountService {
    constructor(private readonly prismaRead: PrismaReadService) { }

    async getUnreadCount(userId: string) {
        // Note: Since Prisma logic for JSON arrays can be tricky, 
        // a more robust approach is fetching relevant project messages 
        // and filtering, or maintaining a separate `UnreadMessage` model.
        // For this simulation, we'll fetch messages where user is involved
        // and filter them in memory, or use raw queries.

        const projects = await this.prismaRead.project.findMany({
            where: { OR: [{ clientId: userId }, { freelancerId: userId }] },
            select: { id: true },
        });

        const projectIds = projects.map(p => p.id);

        const messages = await this.prismaRead.message.findMany({
            where: {
                projectId: { in: projectIds },
                NOT: { senderId: userId },
            },
            select: { id: true, readBy: true },
        });

        const unread = messages.filter(msg => {
            const readBy: any[] = Array.isArray(msg.readBy) ? msg.readBy : [];
            return !readBy.find(r => r.userId === userId);
        });

        return { totalUnread: unread.length };
    }
}
