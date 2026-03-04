import { Test, TestingModule } from '@nestjs/testing';
import { PaymentMilestonesAdminController } from '../../../../src/controllers/admin/payment-milestones.admin.controller';
import { PaymentMilestonesService } from '../../../../src/services/payment-milestones.service';

describe('PaymentMilestonesAdminController', () => {
    let controller: PaymentMilestonesAdminController;
    let milestonesService: jest.Mocked<PaymentMilestonesService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentMilestonesAdminController],
            providers: [
                {
                    provide: PaymentMilestonesService,
                    useValue: {
                        getPaymentsByMilestone: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<PaymentMilestonesAdminController>(PaymentMilestonesAdminController);
        milestonesService = module.get(PaymentMilestonesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getPaymentsByMilestone', () => {
        it('should list payments for a milestone', async () => {
            milestonesService.getPaymentsByMilestone.mockResolvedValue([{ id: 'pay1' }] as any);

            const result = await controller.getPaymentsByMilestone('milestone1');

            expect(milestonesService.getPaymentsByMilestone).toHaveBeenCalledWith('milestone1');
            expect(result).toEqual({ status: 'success', data: [{ id: 'pay1' }] });
        });
    });
});
