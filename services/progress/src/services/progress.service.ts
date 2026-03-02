import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { CreateProgressEntryDto } from '../dto/create-progress-entry.dto';
import { UpdateProgressEntryDto } from '../dto/update-progress-entry.dto';
import { QueryProgressDto } from '../dto/query-progress.dto';
import { ProgressEntryType, Visibility } from '../interfaces/progress.interface';
import { OutboxService } from '@nestlancer/outbox';

@Injectable()
export class ProgressService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly outbox: OutboxService,
    ) { }

    async createEntry(userId: string, projectId: string, dto: CreateProgressEntryDto) {
        const entry = await this.prismaWrite.progressEntry.create({
            data: {
                projectId,
                type: dto.type,
                title: dto.title,
                description: dto.description,
                milestoneId: dto.milestoneId,
                visibility: dto.visibility || Visibility.CLIENT_VISIBLE,
                actorId: userId,
                clientNotified: dto.notifyClient ?? true,
                details: {
                    deliverableIds: dto.deliverableIds,
                    attachmentIds: dto.attachmentIds,
                }
            },
        });

        if (entry.visibility === Visibility.CLIENT_VISIBLE && entry.clientNotified) {
            await this.outbox.createEvent('PROGRESS_ENTRY_CREATED', {
                id: entry.id,
                projectId: entry.projectId,
                type: entry.type,
                title: entry.title,
            } as any);
        }

        return entry;
    }

    async getProjectProgress(projectId: string, query: QueryProgressDto) {
        const { page = 1, limit = 20, type } = query;
        const skip = (page - 1) * limit;

        const where: any = { projectId };
        if (type) {
            where.type = type;
        }

        const [items, total] = await Promise.all([
            this.prismaRead.progressEntry.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prismaRead.progressEntry.count({ where }),
        ]);

        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    async getEntryById(id: string) {
        const entry = await this.prismaRead.progressEntry.findUnique({
            where: { id },
        });
        if (!entry) throw new NotFoundException('Progress entry not found');
        return entry;
    }

    async updateEntry(id: string, dto: UpdateProgressEntryDto) {
        const entry = await this.prismaWrite.progressEntry.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                visibility: dto.visibility,
            },
        });
        return entry;
    }

    async deleteEntry(id: string) {
        await this.prismaWrite.progressEntry.delete({
            where: { id },
        });
        return { success: true };
    }

    async getStatusSummary(projectId: string) {
        const milestones = await this.prismaRead.milestone.findMany({
            where: { projectId },
        });

        if (milestones.length === 0) {
            return { percentageComplete: 0, currentPhase: 'Not Started' };
        }

        const completed = milestones.filter(m => m.status === 'COMPLETED' || m.status === 'REVIEW').length;
        const percentageComplete = Math.round((completed / milestones.length) * 100);

        const activeMilestone = milestones.find(m => m.status === 'IN_PROGRESS');
        const currentPhase = activeMilestone ? activeMilestone.name : (percentageComplete === 100 ? 'Completed' : 'Pending');

        return {
            percentageComplete,
            currentPhase,
        };
    }
}
