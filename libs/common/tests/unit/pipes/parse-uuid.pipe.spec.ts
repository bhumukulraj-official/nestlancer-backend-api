import { ParseUuidPipe } from '../../../src/pipes/parse-uuid.pipe';
import { BadRequestException } from '@nestjs/common';

describe('ParseUuidPipe', () => {
    let pipe: ParseUuidPipe;

    beforeEach(() => {
        pipe = new ParseUuidPipe();
    });

    it('should be defined', () => {
        expect(pipe).toBeDefined();
    });

    it('should return valid UUID as is', async () => {
        const uuid = '550e8400-e29b-41d4-a716-446655440000';
        expect(pipe.transform(uuid)).toBe(uuid);
    });

    it('should throw BadRequestException for invalid UUID', async () => {
        expect(() => pipe.transform('invalid-uuid')).toThrow(BadRequestException);
    });
});
