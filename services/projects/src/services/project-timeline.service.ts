import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException } from '@nestlancer/common';

@Injectable()
export class ProjectTimelineService {
    constructor(private readonly prismaRead: PrismaReadService) { }

    async getTimeline(userId: string, projectId: string) {
        const project = await this.prismaRead.project.findFirst({
            where: { id: projectId, clientId: userId }
        });

        if (!project) throw new BusinessLogicException('Project not found', 'PROJECT_001');

        const progressEntries = await this.prismaRead.progressEntry.findMany({
            where: { projectId, visibility: 'client' },
            orderBy: { createdAt: 'desc' }
        });

        const events = progressEntries.map(entry => ({
            id: entry.id,
            type: entry.type,
            title: entry.title,
            description: entry.description,
            timestamp: entry.createdAt,
        }));

        events.push({
            id: `evt-creation-${project.id}`,
            type: 'projectCreated',
            title: 'Project Created',
            description: 'Project created from accepted quote',
            timestamp: project.createdAt,
        });

        events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        return {
            projectId,
            events,
            upcomingEvents: []
        };
    }
}
