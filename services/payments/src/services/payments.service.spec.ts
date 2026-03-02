import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { PaymentStatus } from '../interfaces/payments.interface';

describe('PaymentsService', () => {
    let service: PaymentsService;

    const mockPrismaReadService = {
        payment: {
            findMany: jest.fn(),
            count: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentsService,
                { provide: PrismaWriteService, useValue: {} },
                { provide: PrismaReadService, useValue: mockPrismaReadService },
            ],
        }).compile();

        service = module.get<PaymentsService>(PaymentsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getMyPayments', () => {
        it('should return paginated payments', async () => {
            mockPrismaReadService.payment.findMany.mockResolvedValue([]);
            mockPrismaReadService.payment.count.mockResolvedValue(0);

            const result = await service.getMyPayments('user1', { page: 1, limit: 10 });

            expect(result.items).toEqual([]);
            expect(result.meta.total).toBe(0);
        });
    });
});
