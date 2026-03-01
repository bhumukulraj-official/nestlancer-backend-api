import { getQuoteTemplate } from '../../../src/templates/quote.template';

describe('QuoteTemplate', () => {
    it('should format money correctly in USD', () => {
        const result = getQuoteTemplate({ totalPaise: 250000, currency: 'USD' });
        expect(result).toContain('USD 2500.00');
    });

    it('should render items correctly', () => {
        const result = getQuoteTemplate({
            items: [
                { description: 'Consulting', quantity: 10, unitPricePaise: 100000, totalPaise: 1000000 }
            ]
        });
        expect(result).toContain('Consulting');
        expect(result).toContain('10');
        expect(result).toContain('INR 1000.00');
        expect(result).toContain('INR 10000.00');
    });

    it('should render terms and description', () => {
        const result = getQuoteTemplate({
            description: 'Custom quote description',
            terms: 'Net 30'
        });
        expect(result).toContain('Custom quote description');
        expect(result).toContain('Net 30');
    });

    it('should default missing values gracefully', () => {
        const result = getQuoteTemplate({});
        expect(result).toContain('Nestlancer');
        expect(result).toContain('QTE-000');
    });
});
