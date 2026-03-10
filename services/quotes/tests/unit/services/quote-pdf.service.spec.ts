jest.mock('puppeteer', () => ({
  launch: jest.fn(),
}));
jest.mock('handlebars', () => ({
  compile: jest.fn().mockReturnValue(jest.fn().mockReturnValue('<html>test</html>')),
}));

import * as puppeteer from 'puppeteer';
import { QuotePdfService } from '../../../src/services/quote-pdf.service';

describe('QuotePdfService', () => {
  let service: QuotePdfService;
  let mockPrismaRead: any;
  let mockConfig: any;

  const mockQuote = {
    id: 'quote-1',
    userId: 'user-1',
    totalAmount: 5000,
    currency: 'INR',
    subtotal: 5000,
    taxAmount: 0,
    items: [{ description: 'Design', quantity: 1, unitPrice: 2000, totalPrice: 2000 }],
    request: { title: 'Build Website' },
    user: { firstName: 'John', lastName: 'Doe', email: 'test@example.com' },
  };

  beforeEach(() => {
    mockPrismaRead = {
      quote: { findFirst: jest.fn().mockResolvedValue(mockQuote) },
    };
    mockConfig = {
      get: jest.fn().mockReturnValue(undefined),
    };

    const mockPage = {
      setContent: jest.fn().mockResolvedValue(undefined),
      pdf: jest.fn().mockResolvedValue(Buffer.from('pdf-data')),
    };
    const mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn().mockResolvedValue(undefined),
    };
    (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

    service = new QuotePdfService(mockPrismaRead, mockConfig);
  });

  describe('generatePdf', () => {
    it('should generate PDF buffer from quote', async () => {
      const result = await service.generatePdf('user-1', 'quote-1');
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(puppeteer.launch).toHaveBeenCalled();
    });

    it('should throw for non-existent quote', async () => {
      mockPrismaRead.quote.findFirst.mockResolvedValue(null);
      await expect(service.generatePdf('user-1', 'invalid')).rejects.toThrow();
    });

    it('should throw when PDF generation fails', async () => {
      (puppeteer.launch as jest.Mock).mockRejectedValue(new Error('Browser failed'));
      await expect(service.generatePdf('user-1', 'quote-1')).rejects.toThrow();
    });
  });
});
