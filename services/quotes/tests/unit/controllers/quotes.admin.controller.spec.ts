import { Test, TestingModule } from '@nestjs/testing';
import { QuotesAdminController } from '../../../src/controllers/quotes.admin.controller';
import { QuotesAdminService } from '../../../src/services/quotes.admin.service';
import { QuoteStatsService } from '../../../src/services/quote-stats.service';
import { HttpStatus } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '@nestlancer/auth-lib';

describe('QuotesAdminController', () => {
    let controller: QuotesAdminController;
    let adminService: jest.Mocked<QuotesAdminService>;
    let statsService: jest.Mocked<QuoteStatsService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuotesAdminController],
            providers: [
                {
                    provide: QuotesAdminService,
                    useValue: {
                        listQuotes: jest.fn(),
                        createQuote: jest.fn(),
                        sendQuote: jest.fn(),
                    },
                },
                {
                    provide: QuoteStatsService,
                    useValue: {
                        getOverallStats: jest.fn(),
                    },
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<QuotesAdminController>(QuotesAdminController);
        adminService = module.get(QuotesAdminService);
        statsService = module.get(QuoteStatsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('listQuotes', () => {
        it('should list quotes with parsed pagination', () => {
            adminService.listQuotes.mockResolvedValue([] as any);

            const result = controller.listQuotes('2', '10');

            expect(adminService.listQuotes).toHaveBeenCalledWith(2, 10);
            expect(result).resolves.toEqual([]);
        });

        it('should use default pagination options', () => {
            adminService.listQuotes.mockResolvedValue([] as any);
            controller.listQuotes(undefined, undefined);
            expect(adminService.listQuotes).toHaveBeenCalledWith(1, 20);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            statsService.getOverallStats.mockResolvedValue({ totalQuotes: 10 } as any);
            const result = controller.getStats();
            expect(result).resolves.toEqual({ totalQuotes: 10 });
        });
    });

    describe('createQuote', () => {
        it('should create a quote and set status to CREATED', async () => {
            adminService.createQuote.mockResolvedValue({ id: 'q1' } as any);
            const res = { status: jest.fn() } as any;
            const dto = { title: 'Test Quote' } as any;

            const result = await controller.createQuote('admin1', dto, res);

            expect(adminService.createQuote).toHaveBeenCalledWith('admin1', dto);
            expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
            expect(result).toEqual({ id: 'q1' });
        });
    });

    describe('sendQuote', () => {
        it('should send a quote', () => {
            adminService.sendQuote.mockResolvedValue({ status: true } as any);
            const result = controller.sendQuote('q1');
            expect(adminService.sendQuote).toHaveBeenCalledWith('q1');
            expect(result).resolves.toEqual({ status: true });
        });
    });
});
