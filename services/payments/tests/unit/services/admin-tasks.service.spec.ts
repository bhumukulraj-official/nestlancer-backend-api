import { Test, TestingModule } from '@nestjs/testing';
import { PaymentDisputesService, PaymentReconciliationService, PaymentStatsService } from '../../../src/services/admin-tasks.service';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { RazorpayService } from '../../../src/services/razorpay.service';
import { NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '../../../src/interfaces/payments.interface';

describe('AdminTasksService', () => {
    let prismaWrite: jest.Mocked<PrismaWriteService>;
    let prismaRead: jest.Mocked<PrismaReadService>;
    let razorpayService: jest.Mocked<RazorpayService>;

    beforeEach(() => {
        prismaWrite = {
            payment: { update: jest.fn() },
            outboxEvent: { create: jest.fn() },
        } as any;
        prismaRead = {
            payment: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), aggregate: jest.fn() },
        } as any;
        razorpayService = {
            fetchPayment: jest.fn(),
        } as any;
    });

    describe('PaymentDisputesService', () => {
        let service: PaymentDisputesService;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    PaymentDisputesService,
                    { provide: PrismaWriteService, useValue: prismaWrite },
                    { provide: PrismaReadService, useValue: prismaRead },
                    { provide: RazorpayService, useValue: razorpayService },
                ],
            }).compile();
            service = module.get<PaymentDisputesService>(PaymentDisputesService);
        });

        describe('getDisputes', () => {
            it('should return paginated disputes', async () => {
                prismaRead.payment.findMany.mockResolvedValue([{ id: '1', amount: 100, client: {}, project: {} }] as any);
                prismaRead.payment.count.mockResolvedValue(1);

                const result = await service.getDisputes({ page: 1 });

                expect(prismaRead.payment.findMany).toHaveBeenCalledWith(expect.objectContaining({
                    where: expect.objectContaining({ refundStatus: { in: ['DISPUTED', 'DISPUTE_PENDING', 'DISPUTE_WON', 'DISPUTE_LOST'] } }),
                }));
                expect(result.items).toHaveLength(1);
            });
        });

        describe('resolveDispute', () => {
            it('should throw NotFoundException if payment not found', async () => {
                prismaRead.payment.findUnique.mockResolvedValue(null);
                await expect(service.resolveDispute('1', { action: 'accept' })).rejects.toThrow(NotFoundException);
            });

            it('should resolve dispute and create outbox event', async () => {
                prismaRead.payment.findUnique.mockResolvedValue({ id: '1', providerDetails: {} } as any);
                prismaWrite.payment.update.mockResolvedValue({} as any);
                prismaWrite.outboxEvent.create.mockResolvedValue({} as any);

                const result = await service.resolveDispute('1', { action: 'accept', notes: 'agreed' });

                expect(prismaWrite.payment.update).toHaveBeenCalledWith(expect.objectContaining({
                    where: { id: '1' },
                    data: expect.objectContaining({ refundStatus: 'DISPUTE_LOST' }),
                }));
                expect(prismaWrite.outboxEvent.create).toHaveBeenCalledWith(expect.objectContaining({
                    data: expect.objectContaining({ type: 'PAYMENT_DISPUTE_RESOLVED' }),
                }));
                expect(result.newStatus).toBe('DISPUTE_LOST');
            });
        });
    });

    describe('PaymentReconciliationService', () => {
        let service: PaymentReconciliationService;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    PaymentReconciliationService,
                    { provide: PrismaWriteService, useValue: prismaWrite },
                    { provide: PrismaReadService, useValue: prismaRead },
                    { provide: RazorpayService, useValue: razorpayService },
                ],
            }).compile();
            service = module.get<PaymentReconciliationService>(PaymentReconciliationService);
        });

        describe('reconcilePayments', () => {
            it('should return 0 reconciled if no payments', async () => {
                prismaRead.payment.findMany.mockResolvedValue([]);
                const result = await service.reconcilePayments({});
                expect(result).toEqual({ totalChecked: 0, reconciled: 0, mismatches: [] });
            });

            it('should identify mismatches and reconcile matched payments', async () => {
                prismaRead.payment.findMany.mockResolvedValue([
                    { id: '1', externalId: 'ext1', amount: 100, status: PaymentStatus.COMPLETED, externalStatus: 'captured' },
                    { id: '2', externalId: 'ext2', amount: 200, status: PaymentStatus.PROCESSING, externalStatus: 'authorized' },
                ] as any);

                // First payment matches
                razorpayService.fetchPayment.mockResolvedValueOnce({ status: 'captured', amount: 10000 } as any);
                // Second payment has amount mismatch
                razorpayService.fetchPayment.mockResolvedValueOnce({ status: 'authorized', amount: 15000 } as any);

                const result = await service.reconcilePayments({});

                expect(result.totalChecked).toBe(2);
                expect(result.reconciled).toBe(1);
                expect(result.mismatches).toHaveLength(1);
                expect(result.mismatches[0]).toEqual({
                    paymentId: '2',
                    localStatus: PaymentStatus.PROCESSING,
                    providerStatus: 'authorized',
                    localAmount: 200,
                    providerAmount: 150,
                    discrepancy: 'amount',
                });
            });
        });
    });

    describe('PaymentStatsService', () => {
        let service: PaymentStatsService;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    PaymentStatsService,
                    { provide: PrismaReadService, useValue: prismaRead },
                ],
            }).compile();
            service = module.get<PaymentStatsService>(PaymentStatsService);
        });

        describe('getStats', () => {
            it('should return aggregated stats', async () => {
                prismaRead.payment.aggregate
                    .mockResolvedValueOnce({ _sum: { amount: 1000 }, _count: { id: 10 } } as any) // total
                    .mockResolvedValueOnce({ _sum: { amount: 800 }, _count: { id: 8 } } as any) // completed
                    .mockResolvedValueOnce({ _sum: { amount: 200 }, _count: { id: 2 } } as any) // pending
                    .mockResolvedValueOnce({ _sum: { amountRefunded: 0 }, _count: { id: 0 } } as any); // refunded
                prismaRead.payment.findMany.mockResolvedValue([{ id: '1', client: {}, project: {} }] as any); // recent

                const result = await service.getStats();

                expect(result.totalRevenue).toBe(800);
                expect(result.totalTransactions).toBe(10);
                expect(result.recentTransactions).toHaveLength(1);
            });
        });
    });
});
