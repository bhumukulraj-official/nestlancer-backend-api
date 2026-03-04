import { Test, TestingModule } from '@nestjs/testing';
import { DashboardRevenueService } from '../../../src/services/dashboard-revenue.service';
import { HttpService } from '@nestjs/axios';
import { PrismaReadService } from '@nestlancer/database';

describe('DashboardRevenueService', () => {
    let service: DashboardRevenueService;
    let prismaRead: jest.Mocked<PrismaReadService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DashboardRevenueService,
                {
                    provide: HttpService,
                    useValue: {},
                },
                {
                    provide: PrismaReadService,
                    useValue: {
                        payment: {
                            aggregate: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<DashboardRevenueService>(DashboardRevenueService);
        prismaRead = module.get(PrismaReadService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getRevenue', () => {
        it('should return overall revenue', async () => {
            prismaRead.payment.aggregate.mockResolvedValue({ _sum: { amount: 1500 } } as any);

            const result = await service.getRevenue({});

            expect(prismaRead.payment.aggregate).toHaveBeenCalledWith({
                where: { status: 'COMPLETED' },
                _sum: { amount: true }
            });
            expect(result.total).toBe(1500);
            expect(result.currency).toBe('INR');
        });

        it('should default to 0 if amount sum is null', async () => {
            prismaRead.payment.aggregate.mockResolvedValue({ _sum: { amount: null } } as any);

            const result = await service.getRevenue({});
            expect(result.total).toBe(0);
        });
    });

    describe('getRevenueOverview', () => {
        it('should return revenue overview', async () => {
            prismaRead.payment.aggregate.mockResolvedValue({ _sum: { amount: 2000 } } as any);
            const result = await service.getRevenueOverview('month');
            expect(result.total).toBe(2000);
            expect(result.trend.current).toBe(2000);
        });
    });
});
