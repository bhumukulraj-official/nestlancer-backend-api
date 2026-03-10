import { Test, TestingModule } from '@nestjs/testing';
import { QuotesAdminService } from '../../../src/services/quotes.admin.service';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException } from '@nestlancer/common';
import { CreateQuoteDto } from '../../../src/dto/create-quote.dto';

describe('QuotesAdminService', () => {
  let service: QuotesAdminService;
  let prismaWrite: jest.Mocked<PrismaWriteService>;
  let prismaRead: jest.Mocked<PrismaReadService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotesAdminService,
        {
          provide: PrismaWriteService,
          useValue: {
            $transaction: jest.fn(),
          },
        },
        {
          provide: PrismaReadService,
          useValue: {
            projectRequest: { findFirst: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<QuotesAdminService>(QuotesAdminService);
    prismaWrite = module.get(PrismaWriteService);
    prismaRead = module.get(PrismaReadService);

    prismaWrite.$transaction.mockImplementation(async (cb: any) => {
      return cb({
        quote: {
          create: jest
            .fn()
            .mockResolvedValue({ id: 'q1', requestId: 'req1', createdAt: new Date(), items: [] }),
        },
        projectRequest: { update: jest.fn().mockResolvedValue({}) },
        requestStatusHistory: { create: jest.fn().mockResolvedValue({}) },
        outbox: { create: jest.fn().mockResolvedValue({}) },
      });
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createQuote', () => {
    const dto: CreateQuoteDto = {
      items: [{ description: 'item1', quantity: 2, unitPrice: 100 }],
      taxPercentage: 10,
      currency: 'USD',
      validUntil: new Date(),
      termsAndConditions: 'test terms',
      internalNotes: 'test notes',
    } as any;

    it('should throw BusinessLogicException if request not found', async () => {
      prismaRead.projectRequest.findFirst.mockResolvedValue(null);
      await expect(service.createQuote('req1', 'admin1', dto)).rejects.toThrow(
        BusinessLogicException,
      );
    });

    it('should throw BusinessLogicException if request is already QUOTED', async () => {
      prismaRead.projectRequest.findFirst.mockResolvedValue({
        id: 'req1',
        status: 'QUOTED',
      } as any);
      await expect(service.createQuote('req1', 'admin1', dto)).rejects.toThrow(
        BusinessLogicException,
      );
    });

    it('should create a quote via transaction and return formatted quote', async () => {
      prismaRead.projectRequest.findFirst.mockResolvedValue({
        id: 'req1',
        userId: 'user1',
        status: 'PENDING',
      } as any);

      const result = await service.createQuote('req1', 'admin1', dto);

      expect(prismaWrite.$transaction).toHaveBeenCalled();

      // Calculate expected amounts
      const subtotal = 2 * 100; // 200
      const taxAmount = subtotal * (10 / 100); // 20
      const totalAmount = subtotal + taxAmount; // 220

      expect(result).toEqual(
        expect.objectContaining({
          id: 'q1',
          requestId: 'req1',
          status: 'pending',
          amount: {
            subtotal,
            taxAmount,
            totalAmount,
            currency: 'USD',
          },
        }),
      );
    });
  });
});
