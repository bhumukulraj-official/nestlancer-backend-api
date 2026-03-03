import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '@nestlancer/database';

@Injectable()
export class MessageSearchService {
    constructor(private readonly prismaRead: PrismaReadService) { }

    async searchMessages(projectId: string, query: string, page = 1, limit = 20) {
        if (!query) {
            return { items: [], meta: { total: 0, page, limit, totalPages: 0 } };
        }

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.prismaRead.message.findMany({
                where: {
                    projectId,
                    deletedAt: null,
                    content: { contains: query, mode: 'insensitive' },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } }
            }),
            this.prismaRead.message.count({
                where: {
                    projectId,
                    deletedAt: null,
                    content: { contains: query, mode: 'insensitive' },
                },
            }),
        ]);

        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
}
