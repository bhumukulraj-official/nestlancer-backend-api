import { Test, TestingModule } from '@nestjs/testing';
import { QuoteStatusService } from '../../../src/services/quote-status.service';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException } from '@nestlancer/common';

describe('QuoteStatusService', () => {
  let service: QuoteStatusService;
  let prismaRead: PrismaReadService;
  let prismaWrite: PrismaWriteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuoteStatusService,
        {
          provide: PrismaReadService,
          useValue: { quote: { findFirst: jest.fn() } },
        },
        {
          provide: PrismaWriteService,
          useValue: {
            $transaction: jest.fn((cb) => cb(prismaWrite)),
            quote: { update: jest.fn() },
            projectRequest: { update: jest.fn() },
            outbox: { create: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<QuoteStatusService>(QuoteStatusService);
    prismaRead = module.get<PrismaReadService>(PrismaReadService);
    prismaWrite = module.get<PrismaWriteService>(PrismaWriteService);
  });

  describe('acceptQuote', () => {
    it('should accept quote successfully', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const mockQuote = {
        id: 'quote1',
        userId: 'user1',
        requestId: 'req1',
        status: 'SENT',
        validUntil: futureDate,
      };
      jest.spyOn(prismaRead.quote, 'findFirst').mockResolvedValue(mockQuote as any);
      jest.spyOn(prismaWrite.quote, 'update').mockResolvedValue({ acceptedAt: new Date() } as any);

      const dto: any = { signatureName: 'John', signatureDate: new Date().toISOString() };
      const result = await service.acceptQuote('user1', 'quote1', dto);

      expect(result.status).toEqual('accepted');
      expect(prismaWrite.quote.update).toHaveBeenCalled();
      expect(prismaWrite.outbox.create).toHaveBeenCalled();
    });

    it('should throw if quote expired', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const mockQuote = {
        id: 'quote1',
        userId: 'user1',
        requestId: 'req1',
        status: 'SENT',
        validUntil: pastDate,
      };
      jest.spyOn(prismaRead.quote, 'findFirst').mockResolvedValue(mockQuote as any);

      const dto: any = { signatureName: 'John', signatureDate: new Date().toISOString() };
      await expect(service.acceptQuote('user1', 'quote1', dto)).rejects.toThrow();
    });
  });
});
