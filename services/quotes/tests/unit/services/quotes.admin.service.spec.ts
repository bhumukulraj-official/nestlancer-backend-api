import { QuotesAdminService } from '../../../src/services/quotes.admin.service';

describe('QuotesAdminService', () => {
  let service: QuotesAdminService;
  let mockPrismaWrite: any;
  let mockPrismaRead: any;

  beforeEach(() => {
    mockPrismaRead = {
      quote: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            {
              id: 'q1',
              status: 'SENT',
              totalAmount: 5000,
              currency: 'INR',
              createdAt: new Date(),
              user: { firstName: 'John', email: 'test@example.com' },
            },
          ]),
        count: jest.fn().mockResolvedValue(1),
        findUnique: jest.fn().mockResolvedValue({ id: 'q1', userId: 'user-1', status: 'DRAFT' }),
      },
      projectRequest: {
        findUnique: jest.fn().mockResolvedValue({ id: 'req-1', userId: 'user-1' }),
      },
    };
    mockPrismaWrite = {
      quote: {
        create: jest
          .fn()
          .mockResolvedValue({ id: 'q-new', status: 'DRAFT', totalAmount: 5000, currency: 'INR' }),
      },
      $transaction: jest.fn().mockImplementation(async (fn) => {
        const tx = {
          quote: { update: jest.fn().mockResolvedValue({}) },
          outbox: { create: jest.fn().mockResolvedValue({}) },
        };
        return fn(tx);
      }),
    };
    service = new QuotesAdminService(mockPrismaWrite, mockPrismaRead);
  });

  describe('listQuotes', () => {
    it('should return paginated quotes', async () => {
      const result = await service.listQuotes(1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('createQuote', () => {
    it('should create a quote for a valid request', async () => {
      const dto = {
        requestId: 'req-1',
        totalAmount: 5000,
        currency: 'INR',
        validUntil: new Date().toISOString(),
        terms: 'Standard',
        notes: '',
        paymentBreakdown: [{ milestone: 'Advance', amount: 5000 }],
      };
      const result = await service.createQuote('admin-1', dto as any);
      expect(result.id).toBe('q-new');
      expect(result.status).toBe('draft');
    });

    it('should throw for non-existent request', async () => {
      mockPrismaRead.projectRequest.findUnique.mockResolvedValue(null);
      await expect(
        service.createQuote('admin-1', { requestId: 'invalid' } as any),
      ).rejects.toThrow();
    });

    it('should throw when payment breakdown total mismatch', async () => {
      const dto = {
        requestId: 'req-1',
        totalAmount: 5000,
        currency: 'INR',
        validUntil: new Date().toISOString(),
        paymentBreakdown: [{ milestone: 'Advance', amount: 3000 }],
      };
      await expect(service.createQuote('admin-1', dto as any)).rejects.toThrow();
    });
  });

  describe('sendQuote', () => {
    it('should send a quote successfully', async () => {
      const result = await service.sendQuote('q1');
      expect(result).toBe(true);
      expect(mockPrismaWrite.$transaction).toHaveBeenCalled();
    });

    it('should throw for non-existent quote', async () => {
      mockPrismaRead.quote.findUnique.mockResolvedValue(null);
      await expect(service.sendQuote('invalid')).rejects.toThrow();
    });
  });
});
