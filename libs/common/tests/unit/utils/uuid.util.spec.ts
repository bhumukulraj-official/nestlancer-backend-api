import { generateUuid, isValidUuid } from '../../../src/utils/uuid.util';

describe('UuidUtils', () => {
    describe('generateUuid', () => {
        it('should generate a valid UUID v4', () => {
            const uuid = generateUuid();
            expect(isValidUuid(uuid)).toBe(true);
        });

        it('should generate unique values', () => {
            const uuid1 = generateUuid();
            const uuid2 = generateUuid();
            expect(uuid1).not.toBe(uuid2);
        });
    });

    describe('isValidUuid', () => {
        it('should return true for valid UUID v4', () => {
            expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
            expect(isValidUuid('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
        });

        it('should return false for invalid UUIDs', () => {
            expect(isValidUuid('invalid-uuid')).toBe(false);
            expect(isValidUuid('550e8400-e29b-11d4-a716-446655440000')).toBe(false); // v1
            expect(isValidUuid('550e8400e29b41d4a716446655440000')).toBe(false);
        });
    });
});
