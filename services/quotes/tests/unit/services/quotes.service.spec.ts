import { QuotesService } from '../../../src/services/quotes.service';

describe('QuotesService', () => {
  let service: QuotesService;
  let mockPrismaWrite: any;
  let mockPrismaRead: any;

  const mockQuote = {
    id: 'quote-1',
    requestId: 'req-1',
    status: 'SENT',
    totalAmount: 5000,
    currency: 'INR',
    validUntil: new Date(Date.now() + 86400000 * 7),
    createdAt: new Date(),
    request: { title: 'Build Website', createdAt: new Date() },
    items: [{ description: 'Design', quantity: 1, unitPrice: 2000, totalPrice: 2000 }],
    user: { firstName: 'John', lastName: 'Doe', email: 'test@example.com' },
    scope: JSON.stringify({ included: ['Design'], excluded: ['Hosting'] }),
    timeline: JSON.stringify({ estimatedStartDate: new Date(), estimatedEndDate: new Date() }),
    paymentBreakdown: JSON.stringify([{ milestone: 'Advance', amount: 2500 }]),
    subtotal: 5000,
    taxRate: 0,
    taxAmount: 0,
    sentAt: new Date(),
    viewedAt: null,
    acceptedAt: null,
    declinedAt: null,
    attachments: [],
  };

  beforeEach(() => {
    mockPrismaRead = {
      quote: {
        findMany: jest.fn().mockResolvedValue([mockQuote]),
        findFirst: jest.fn().mockResolvedValue(mockQuote),
      },
    };
    mockPrismaWrite = {
      quote: {
        update: jest.fn().mockResolvedValue({}),
      },
    };

    service = new QuotesService(mockPrismaWrite, mockPrismaRead);
  });

  describe('getMyQuotes', () => {
    it('should return formatted quote summaries', async () => {
      const result = await service.getMyQuotes('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('quote-1');
      expect(result[0].totalAmount).toBe(5000);
    });

    it('should return empty array when no quotes', async () => {
      mockPrismaRead.quote.findMany.mockResolvedValue([]);
      const result = await service.getMyQuotes('user-1');
      expect(result).toHaveLength(0);
    });
  });

  describe('getQuoteDetails', () => {
    it('should return detailed quote information', async () => {
      const result = await service.getQuoteDetails('user-1', 'quote-1');
      expect(result.id).toBe('quote-1');
      expect(result.totalAmount).toBe(5000);
    });

    it('should throw for non-existent quote', async () => {
      mockPrismaRead.quote.findFirst.mockResolvedValue(null);
      await expect(service.getQuoteDetails('user-1', 'invalid')).rejects.toThrow();
    });
  });
});
