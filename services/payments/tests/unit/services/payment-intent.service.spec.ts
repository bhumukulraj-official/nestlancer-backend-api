import { PaymentIntentService } from '../../../src/services/payment-intent.service';

describe('PaymentIntentService', () => {
    let service: PaymentIntentService;
    let mockPrismaWrite: any;
    let mockRazorpayService: any;

    beforeEach(() => {
        mockPrismaWrite = {
            payment: {
                create: jest.fn().mockResolvedValue({ id: 'pay-1', projectId: 'proj-1', amount: 5000, currency: 'INR', status: 'CREATED' }),
                update: jest.fn().mockResolvedValue({ id: 'pay-1', intentId: 'order_123', status: 'PENDING', projectId: 'proj-1', amount: 5000, currency: 'INR' }),
            },
        };
        mockRazorpayService = {
            createOrder: jest.fn().mockResolvedValue({ id: 'order_123', amount: 500000, currency: 'INR' }),
        };
        service = new PaymentIntentService(mockPrismaWrite, mockRazorpayService);
    });

    describe('createIntent', () => {
        const dto = { projectId: 'proj-1', milestoneId: 'ms-1', amount: 5000, currency: 'INR' };

        it('should create payment intent successfully', async () => {
            const result = await service.createIntent('user-1', dto as any);
            expect(result.id).toBe('pay-1');
            expect(result.clientSecret).toBe('order_123');
            expect(result.amount).toBe(5000);
            expect(mockRazorpayService.createOrder).toHaveBeenCalledWith(5000, 'INR', 'rcpt_pay-1');
        });

        it('should throw when Razorpay fails', async () => {
            mockRazorpayService.createOrder.mockResolvedValue(null);
            await expect(service.createIntent('user-1', dto as any)).rejects.toThrow();
            expect(mockPrismaWrite.payment.update).toHaveBeenCalledWith(
                expect.objectContaining({ data: { status: 'FAILED' } })
            );
        });
    });
});
