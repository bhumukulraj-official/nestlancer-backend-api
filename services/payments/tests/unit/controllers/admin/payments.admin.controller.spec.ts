import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsAdminController } from '../../../../src/controllers/admin/payments.admin.controller';
import { PaymentsService } from '../../../../src/services/payments.service';
import { RefundService } from '../../../../src/services/refund.service';
import { PaymentStatsService } from '../../../../src/services/admin-tasks.service';
import { ProcessRefundDto } from '../../../../src/dto/process-refund.dto';

describe('PaymentsAdminController', () => {
    let controller: PaymentsAdminController;
    let paymentsService: jest.Mocked<PaymentsService>;
    let refundService: jest.Mocked<RefundService>;
    let statsService: jest.Mocked<PaymentStatsService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentsAdminController],
            providers: [
                {
                    provide: PaymentsService,
                    useValue: { getAdminPayments: jest.fn() },
                },
                {
                    provide: RefundService,
                    useValue: { processRefund: jest.fn() },
                },
                {
                    provide: PaymentStatsService,
                    useValue: { getStats: jest.fn() },
                },
            ],
        }).compile();

        controller = module.get<PaymentsAdminController>(PaymentsAdminController);
        paymentsService = module.get(PaymentsService);
        refundService = module.get(RefundService);
        statsService = module.get(PaymentStatsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getPayments', () => {
        it('should call getAdminPayments', async () => {
            paymentsService.getAdminPayments.mockResolvedValue({ items: [], total: 0 } as any);

            const result = await controller.getPayments({ page: 1 });

            expect(paymentsService.getAdminPayments).toHaveBeenCalledWith({ page: 1 });
            expect(result).toEqual({ status: 'success', items: [], total: 0 });
        });
    });

    describe('getStats', () => {
        it('should return payment stats', async () => {
            statsService.getStats.mockResolvedValue({ totalRevenue: 100 } as any);

            const result = await controller.getStats();

            expect(statsService.getStats).toHaveBeenCalled();
            expect(result).toEqual({ status: 'success', data: { totalRevenue: 100 } });
        });
    });

    describe('processRefund', () => {
        it('should process a refund', async () => {
            refundService.processRefund.mockResolvedValue({ id: 'refund1' } as any);
            const dto = new ProcessRefundDto();

            const result = await controller.processRefund('pay1', 'admin1', dto);

            expect(refundService.processRefund).toHaveBeenCalledWith('pay1', 'admin1', dto);
            expect(result).toEqual({ status: 'success', data: { id: 'refund1' } });
        });
    });
});
