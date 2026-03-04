import { Test, TestingModule } from '@nestjs/testing';
import { QuotesController } from '../../../src/controllers/quotes.controller';
import { QuotesService } from '../../../src/services/quotes.service';
import { QuoteStatusService } from '../../../src/services/quote-status.service';
import { QuotePdfService } from '../../../src/services/quote-pdf.service';
import { QuoteStatsService } from '../../../src/services/quote-stats.service';
import { Response } from 'express';
import { JwtAuthGuard } from '@nestlancer/auth-lib';

describe('QuotesController', () => {
    let controller: QuotesController;
    let statusService: QuoteStatusService;
    let pdfService: QuotePdfService;

    const mockResponse = () => {
        const res: Partial<Response> = {};
        res.set = jest.fn();
        res.end = jest.fn();
        return res as Response;
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuotesController],
            providers: [
                { provide: QuotesService, useValue: { getMyQuotes: jest.fn(), getQuoteDetails: jest.fn() } },
                {
                    provide: QuoteStatusService,
                    useValue: { acceptQuote: jest.fn(), declineQuote: jest.fn(), requestChanges: jest.fn() },
                },
                { provide: QuotePdfService, useValue: { generatePdf: jest.fn() } },
                { provide: QuoteStatsService, useValue: { getUserStats: jest.fn() } },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<QuotesController>(QuotesController);
        statusService = module.get<QuoteStatusService>(QuoteStatusService);
        pdfService = module.get<QuotePdfService>(QuotePdfService);
    });

    describe('acceptQuote', () => {
        it('should call statusService.acceptQuote', async () => {
            const mockResult = { status: 'accepted' };
            jest.spyOn(statusService, 'acceptQuote').mockResolvedValue(mockResult as any);

            const dto: any = { acceptTerms: true, signatureName: 'Test', signatureDate: new Date().toISOString() };
            const result = await controller.acceptQuote('user1', 'quote1', dto);

            expect(result).toEqual(mockResult);
            expect(statusService.acceptQuote).toHaveBeenCalledWith('user1', 'quote1', dto);
        });
    });

    describe('downloadPdf', () => {
        it('should set headers and stream pdf', async () => {
            const mockBuffer = Buffer.from('mock pdf');
            jest.spyOn(pdfService, 'generatePdf').mockResolvedValue(mockBuffer);

            const res = mockResponse();
            await controller.downloadPdf('user1', 'quote1', res);

            expect(pdfService.generatePdf).toHaveBeenCalledWith('user1', 'quote1');
            expect(res.set).toHaveBeenCalled();
            expect(res.end).toHaveBeenCalledWith(mockBuffer);
        });
    });
});
