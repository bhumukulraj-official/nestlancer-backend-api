import { ParseUUIDPipe } from '../../src/pipes/parse-uuid.pipe';
import { BadRequestException } from '@nestjs/common';

describe('ParseUUIDPipe', () => {
    let pipe: ParseUUIDPipe;

    beforeEach(() => {
        pipe = new ParseUUIDPipe();
    });

    it('should be defined', () => {
        expect(pipe).toBeDefined();
    });

    it('should return valid UUID as is', async () => {
        const uuid = '550e8400-e29b-41d4-a716-446655440000';
        expect(await pipe.transform(uuid, {} as any)).toBe(uuid);
    });

    it('should throw BadRequestException for invalid UUID', async () => {
        await expect(pipe.transform('invalid-uuid', {} as any)).rejects.toThrow(BadRequestException);
    });
});
