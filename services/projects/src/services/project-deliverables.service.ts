import { Injectable } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database/prisma/prisma-write.service';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { BusinessLogicException } from '@nestlancer/common/exceptions/business-logic.exception';
import { StorageService } from '@nestlancer/storage/storage.service';

@Injectable()
export class ProjectDeliverablesService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly storage: StorageService,
    ) { }

    async getDeliverables(userId: string, projectId: string) {
        const project = await this.prismaRead.project.findFirst({
            where: { id: projectId, userId }
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
