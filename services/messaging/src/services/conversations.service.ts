import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';

@Injectable()
export class ConversationsService {
    constructor(private readonly prismaRead: PrismaReadService) { }

    async getConversations(userId: string, query: { page?: number; limit?: number }) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        // A conversation is typically mapped to a project in this domain.
        // Fetch projects where the user is a client or freelancer
        const projects = await this.prismaRead.project.findMany({
            where: {
                OR: [
                    { clientId: userId },
                    { freelancerId: userId },
                ],
            },
            skip,
            take: limit,
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1, // Get latest message
                }
            }
        });

        const total = await this.prismaRead.project.count({
            where: {
                OR: [
                    { clientId: userId },
                    { freelancerId: userId },
                ],
            },
        });

        const conversations = projects.map(p => ({
            projectId: p.id,
            title: p.title,
            latestMessage: p.messages[0] || null,
        }));

        return {
            items: conversations,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
}
