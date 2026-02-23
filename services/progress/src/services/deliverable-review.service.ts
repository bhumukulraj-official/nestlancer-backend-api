import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database/prisma/prisma-write.service';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { ApproveDeliverableDto } from '../dto/approve-deliverable.dto';
import { RejectDeliverableDto } from '../dto/reject-deliverable.dto';

@Injectable()
export class DeliverableReviewService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async approve(deliverableId: string, userId: string, dto: ApproveDeliverableDto) {
        const deliverable = await this.prismaRead.deliverable.findUnique({ where: { id: deliverableId } });
        if (!deliverable) throw new NotFoundException('Deliverable not found');
        if (deliverable.status === 'APPROVED') {
            throw new BadRequestException('Deliverable is already approved');
        }

        const updated = await this.prismaWrite.deliverable.update({
            where: { id: deliverableId },
            data: {
                status: 'APPROVED',
                approvedAt: new Date(),
                // Note: we can map the feedback/rating to a review object inside the details Json if needed
            }
        });

        return updated;
    }

    async reject(deliverableId: string, userId: string, dto: RejectDeliverableDto) {
        const deliverable = await this.prismaRead.deliverable.findUnique({ where: { id: deliverableId } });
        if (!deliverable) throw new NotFoundException('Deliverable not found');

        const updated = await this.prismaWrite.deliverable.update({
            where: { id: deliverableId },
            data: {
                status: 'REJECTED',
                // Note: we can map the reasoning to Json or progressEntry
            }
        });

        return updated;
    }
}
