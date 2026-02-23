import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database/prisma/prisma-write.service';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { StorageService } from '@nestlancer/storage';
import { UploadDeliverableDto } from '../dto/upload-deliverable.dto';
import { UpdateDeliverableDto } from '../dto/update-deliverable.dto';

@Injectable()
export class DeliverablesService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly storage: StorageService,
    ) { }

    async create(projectId: string, dto: UploadDeliverableDto) {
        // Basic implementation: Creates a deliverable record representing the uploaded media
        // A real implementation would loop through mediaIds and create multiple if needed
        // or store an array of media IDs depending on DB schema.
        const deliverable = await this.prismaWrite.deliverable.create({
            data: {
                milestoneId: dto.milestoneId,
                name: 'Deliverable Upload',
                description: dto.description,
                status: 'PENDING',
                attachments: dto.mediaIds, // Stored as Json array
            }
        });

        return deliverable;
    }

    async getProjectDeliverables(projectId: string) {
        // We get deliverables by joining through milestones
        const milestones = await this.prismaRead.milestone.findMany({
            where: { projectId },
            select: { id: true }
        });

        const milestoneIds = milestones.map(m => m.id);

        const deliverables = await this.prismaRead.deliverable.findMany({
            where: { milestoneId: { in: milestoneIds } },
            orderBy: { createdAt: 'desc' }
        });

        // Generate download URLs dynamically for each attachment
        for (const d of deliverables) {
            if (d.attachments && Array.isArray(d.attachments)) {
                // Mocking signed url generation via StorageService
                const mediaUrls = await Promise.all(d.attachments.map(async (mediaId) => {
                    return {
                        mediaId,
                        url: await this.storage.getSignedUrl(`deliverables/${mediaId}`), // Example proxy generated URL
                    };
                }));
                (d as any).mediaUrls = mediaUrls;
            }
        }

        return deliverables;
    }

    async update(id: string, dto: UpdateDeliverableDto) {
        const deliverable = await this.prismaWrite.deliverable.update({
            where: { id },
            data: {
                description: dto.description,
            },
        });
        return deliverable;
    }

    async delete(id: string) {
        await this.prismaWrite.deliverable.delete({
            where: { id },
        });
        return { success: true };
    }
}
