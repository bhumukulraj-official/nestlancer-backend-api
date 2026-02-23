import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { QueryProgressDto } from '../dto/query-progress.dto';
import { TimelineEntry } from '../interfaces/progress.interface';

@Injectable()
export class ProgressTimelineService {
    constructor(private readonly prismaRead: PrismaReadService) { }

    async getTimeline(projectId: string, query: QueryProgressDto) {
        const { page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        // A real implementation would UNION across progress entries, milestones, deliverables
        // For now, we query progress entries which acts as the aggregated log.
        const entries = await this.prismaRead.progressEntry.findMany({
            where: { projectId, visibility: 'CLIENT_VISIBLE' },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                milestone: {
                    select: { id: true, name: true }
                }
            }
        });

        const total = await this.prismaRead.progressEntry.count({
            where: { projectId, visibility: 'CLIENT_VISIBLE' }
        });

        const timeline: TimelineEntry[] = entries.map(entry => ({
            id: entry.id,
            type: 'PROGRESS',
            title: entry.title,
            description: entry.description,
            date: entry.createdAt,
            metadata: {
                entryType: entry.type,
                milestone: entry.milestone,
            }
        }));

        return {
            items: timeline,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }
}
