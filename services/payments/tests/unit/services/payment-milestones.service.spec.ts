import { Test, TestingModule } from '@nestjs/testing';
import { PaymentMilestonesService } from '../../src/services/payment-milestones.service';
import { PrismaReadService } from '@nestlancer/database';

describe('PaymentMilestonesService', () => {
    let service: PaymentMilestonesService;
    let prismaRead: jest.Mocked<PrismaReadService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentMilestonesService,
                {
                    provide: PrismaReadService,
                    useValue: {
                        payment: { findMany: jest.fn() },
                    },
                },
            ],
        }).compile();

        service = module.get<PaymentMilestonesService>(PaymentMilestonesService);
        prismaRead = module.get(PrismaReadService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getPaymentsByMilestone', () => {
        it('should return payments for a milestone', async () => {
            prismaRead.payment.findMany.mockResolvedValue([{ id: 'p1' }] as any);

            const result = await service.getPaymentsByMilestone('m1');

            expect(prismaRead.payment.findMany).toHaveBeenCalledWith({
                where: { milestoneId: 'm1' },
                orderBy: { createdAt: 'desc' },
            });
            expect(result).toHaveLength(1);
        });
    });

    describe('getMilestonePaymentStatus', () => {
        it('should calculate total paid for milestone', async () => {
            prismaRead.payment.findMany.mockResolvedValue([
                { amount: 100, status: 'COMPLETED', amountRefunded: 0 },
                { amount: 50, status: 'REFUNDED', amountRefunded: 50 },
                { amount: 200, status: 'PENDING', amountRefunded: 0 },
            ] as any);

            const result = await service.getMilestonePaymentStatus('m1');

            expect(prismaRead.payment.findMany).toHaveBeenCalledWith({
                where: { milestoneId: 'm1' },
                select: { amount: true, status: true, amountRefunded: true },
            });
            expect(result.totalPaid).toBe(100); // 100 + (50 - 50)
            expect(result.paymentsCount).toBe(3);
        });
    });
});
