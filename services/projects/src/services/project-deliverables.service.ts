import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException } from '@nestlancer/common';
import { StorageService } from '@nestlancer/storage';

@Injectable()
export class ProjectDeliverablesService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly storage: StorageService,
    ) { }

    async getDeliverables(userId: string, projectId: string) {
        const project = await this.prismaRead.project.findFirst({
            where: { id: projectId, clientId: userId }
        });

        if (!project) throw new BusinessLogicException('Project not found', 'PROJECT_001');

        const milestones = await this.prismaRead.milestone.findMany({
            where: { projectId }
        });

        const milestoneIds = milestones.map(m => m.id);

        const items = await this.prismaRead.deliverable.findMany({
            where: { milestoneId: { in: milestoneIds } },
            orderBy: { createdAt: 'desc' }
        });

        const total = items.length;
        const completed = items.filter(i => i.status === 'APPROVED').length;
        const pending = items.filter(i => i.status === 'PENDING' || i.status === 'IN_PROGRESS').length;

        return {
            total,
            completed,
            pending,
            items
        };
    }

    // Admin and contractor methods would be here to upload and approve
}
