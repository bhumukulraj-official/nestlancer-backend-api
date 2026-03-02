import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException } from '@nestlancer/common';

@Injectable()
export class ProjectPaymentsService {
    constructor(private readonly prismaRead: PrismaReadService) { }

    async getPayments(userId: string, projectId: string) {
        const project = await this.prismaRead.project.findFirst({
            where: { id: projectId, userId },
            include: {
                quote: { select: { totalAmount: true } }
            }
        });

        if (!project) throw new BusinessLogicException('Project not found', 'PROJECT_001');

        // Fetch actual payments from a payment/invoice table
        return {
            total: project.quote?.totalAmount || 0,
            paid: 0, // Mock
            pending: project.quote?.totalAmount || 0, // Mock
            nextPayment: null,
            history: []
        };
    }
}
