import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from '../../../../src/controllers/user/payments.controller';
import { PaymentsService } from '../../../../src/services/payments.service';
import { PaymentIntentService } from '../../../../src/services/payment-intent.service';
import { PaymentConfirmationService } from '../../../../src/services/payment-confirmation.service';
import { ReceiptPdfService, InvoicePdfService } from '../../../../src/services/pdf.service';

describe('PaymentsController', () => {
    let controller: PaymentsController;

    const mockPaymentsService = {};
    const mockIntentService = {};
    const mockConfirmationService = {};
    const mockReceiptService = {};
    const mockInvoiceService = {};

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentsController],
            providers: [
                { provide: PaymentsService, useValue: mockPaymentsService },
                { provide: PaymentIntentService, useValue: mockIntentService },
                { provide: PaymentConfirmationService, useValue: mockConfirmationService },
                { provide: ReceiptPdfService, useValue: mockReceiptService },
                { provide: InvoicePdfService, useValue: mockInvoiceService },
            ],
        }).compile();

        controller = module.get<PaymentsController>(PaymentsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
