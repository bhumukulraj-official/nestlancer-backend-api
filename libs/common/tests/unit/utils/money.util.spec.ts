import { toPaise, toRupees, formatINR, isValidAmount } from '../../../src/utils/money.util';

describe('MoneyUtils', () => {
    describe('toPaise', () => {
        it('should convert rupees to paise', () => {
            expect(toPaise(10.5)).toBe(1050);
            expect(toPaise(0.99)).toBe(99);
        });

        it('should handle floating point rounding', () => {
            expect(toPaise(1.1)).toBe(110);
            expect(toPaise(1.005)).toBe(100);
        });
    });

    describe('toRupees', () => {
        it('should convert paise to rupees', () => {
            expect(toRupees(1050)).toBe(10.5);
            expect(toRupees(99)).toBe(0.99);
        });
    });

    describe('formatINR', () => {
        it('should format paise as INR string', () => {
            expect(formatINR(100000)).toBe('₹1,000.00');
            expect(formatINR(5050)).toBe('₹50.50');
        });
    });

    describe('isValidAmount', () => {
        it('should validate positive integers', () => {
            expect(isValidAmount(100)).toBe(true);
            expect(isValidAmount(1)).toBe(true);
        });

        it('should reject non-integers and non-positive numbers', () => {
            expect(isValidAmount(10.5)).toBe(false);
            expect(isValidAmount(0)).toBe(false);
            expect(isValidAmount(-100)).toBe(false);
        });
    });
});
