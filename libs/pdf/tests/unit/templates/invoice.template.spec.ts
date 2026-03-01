import { getInvoiceTemplate } from '../../../src/templates/invoice.template';

describe('InvoiceTemplate', () => {
    it('should format money correctly in INR', () => {
        const result = getInvoiceTemplate({ totalPaise: 150000 });
        expect(result).toContain('INR 1500.00');
    });

    it('should render items correctly', () => {
        const result = getInvoiceTemplate({
            items: [
                { description: 'Test Item', quantity: 2, unitPricePaise: 5000, totalPaise: 10000 }
            ]
        });
        expect(result).toContain('Test Item');
        expect(result).toContain('INR 50.00');
        expect(result).toContain('INR 100.00');
    });

    it('should render company and client info', () => {
        const result = getInvoiceTemplate({
            company: { name: 'MyCompany' },
            client: { name: 'MyClient' }
        });
        expect(result).toContain('MyCompany');
        expect(result).toContain('MyClient');
    });

    it('should default missing values gracefully', () => {
        const result = getInvoiceTemplate({});
        expect(result).toContain('Nestlancer');
        expect(result).toContain('INV-000');
    });
});
