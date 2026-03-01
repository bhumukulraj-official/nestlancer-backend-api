import { getReceiptTemplate } from '../../../src/templates/receipt.template';

describe('Receipt Template', () => {
    it('should render a valid HTML receipt with basic data', () => {
        const data = {
            receiptNumber: 'RCT-1234',
            amountPaise: 50000,
            currency: 'USD',
            company: { name: 'TestCompany', address: '123 Test St' },
            client: { name: 'John Doe', email: 'john@example.com' },
            paymentMethod: 'Credit Card',
            transactionId: 'txn_9876'
        };

        const html = getReceiptTemplate(data);
        expect(html).toContain('TestCompany');
        expect(html).toContain('RCT-1234');
        expect(html).toContain('John Doe');
        expect(html).toContain('USD 500.00');
        expect(html).toContain('txn_9876');
    });

    it('should gracefully handle missing optional fields', () => {
        const html = getReceiptTemplate({});
        expect(html).toContain('Nestlancer'); // Default company
        expect(html).toContain('RCT-000'); // Default receipt
        expect(html).toContain('INR 0.00'); // Default amount
        expect(html).not.toContain('Transaction ID'); // Should not show transaction ID row if empty
    });
});
