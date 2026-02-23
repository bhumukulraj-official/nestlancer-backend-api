import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { BusinessLogicException } from '@nestlancer/common/exceptions/business-logic.exception';

@Injectable()
export class ProjectTimelineService {
    constructor(private readonly prismaRead: PrismaReadService) { }

    async getTimeline(userId: string, projectId: string) {
        const project = await this.prismaRead.project.findFirst({
            where: { id: projectId, userId }
        });

        if (!project) throw new BusinessLogicException('Project not found', 'PROJECT_001');

        // In a real implementation we'd fetch from an event/history table
        // For now we mock the timeline response based on standard status
        const events = [
            {
                id: 'evt1',
                type: 'projectCreated',
                title: 'Project Created',
                description: 'Project created from accepted quote',
                timestamp: project.createdAt,
            }
        ];

        if (project.status !== 'CREATED' && project.status !== 'PENDING_PAYMENT') {
            events.push({
                id: 'evt2',
                type: 'statusChange',
                title: 'Project Started',
                description: 'Status changed to In Progress',
                timestamp: project.updatedAt,
            });
        }

        return {
            projectId,
            events,
            upcomingEvents: []
        };
    }
}
