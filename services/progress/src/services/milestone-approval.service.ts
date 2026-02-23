import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database/prisma/prisma-write.service';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { ApproveMilestoneDto } from '../dto/approve-milestone.dto';
import { RequestMilestoneRevisionDto } from '../dto/request-milestone-revision.dto';
import { OutboxService } from '@nestlancer/outbox';

@Injectable()
export class MilestoneApprovalService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly outbox: OutboxService,
    ) { }

    async approve(milestoneId: string, userId: string, dto: ApproveMilestoneDto) {
        const milestone = await this.prismaRead.milestone.findUnique({ where: { id: milestoneId } });
        if (!milestone) throw new NotFoundException('Milestone not found');
        if (milestone.status !== 'COMPLETED') {
            throw new BadRequestException('Only COMPLETED milestones can be approved');
        }

        const updated = await this.prismaWrite.$transaction(async (tx) => {
            const ms = await tx.milestone.update({
                where: { id: milestoneId },
                data: {
                    status: 'APPROVED',
                    approvedAt: new Date(),
                },
            });

            // Record feedback as progress entry
            if (dto.feedback) {
                await tx.progressEntry.create({
                    data: {
                        projectId: ms.projectId,
                        milestoneId: ms.id,
                        type: 'UPDATE',
                        title: 'Milestone Approved',
                        description: dto.feedback,
                        actorId: userId,
                        visibility: 'CLIENT_VISIBLE',
                    }
                });
            }

            await tx.outbox.create({
                data: {
                    eventType: 'MILESTONE_APPROVED',
                    payload: {
                        milestoneId: ms.id,
                        projectId: ms.projectId,
                        approvedBy: userId,
                    }
                }
            });

            return ms;
        });

        return updated;
    }

    async requestRevision(milestoneId: string, userId: string, dto: RequestMilestoneRevisionDto) {
        const milestone = await this.prismaRead.milestone.findUnique({ where: { id: milestoneId } });
        if (!milestone) throw new NotFoundException('Milestone not found');
        if (milestone.status !== 'COMPLETED') {
            throw new BadRequestException('Can only request revision on COMPLETED milestones');
        }

        const updated = await this.prismaWrite.$transaction(async (tx) => {
            const ms = await tx.milestone.update({
                where: { id: milestoneId },
                data: {
                    status: 'REVISION_REQUESTED',
                },
            });

            await tx.progressEntry.create({
                data: {
                    projectId: ms.projectId,
                    milestoneId: ms.id,
                    type: 'UPDATE',
                    title: 'Revision Requested on Milestone',
                    description: dto.reason,
                    actorId: userId,
                    visibility: 'CLIENT_VISIBLE',
                }
            });

            await tx.outbox.create({
                data: {
                    eventType: 'MILESTONE_REVISION_REQUESTED',
                    payload: {
                        milestoneId: ms.id,
                        projectId: ms.projectId,
                        requestedBy: userId,
                        reason: dto.reason,
                    }
                }
            });

            return ms;
        });

        return updated;
    }
}
