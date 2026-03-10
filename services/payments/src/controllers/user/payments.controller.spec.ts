import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from '../../services/payments.service';
import { PaymentIntentService } from '../../services/payment-intent.service';
import { PaymentConfirmationService } from '../../services/payment-confirmation.service';
import { ReceiptPdfService, InvoicePdfService } from '../../services/pdf.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;

  const mockPaymentsService = {
    getMyPayments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: PaymentsService, useValue: mockPaymentsService },
        { provide: PaymentIntentService, useValue: {} },
        { provide: PaymentConfirmationService, useValue: {} },
        { provide: ReceiptPdfService, useValue: {} },
        { provide: InvoicePdfService, useValue: {} },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyPayments', () => {
    it('should return paginated payments', async () => {
      mockPaymentsService.getMyPayments.mockResolvedValue({ items: [], meta: { total: 0 } });
      const result = await controller.getMyPayments('u1', {});
      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('items');
    });
  });
});
