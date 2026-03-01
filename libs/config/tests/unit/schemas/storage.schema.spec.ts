import { storageConfigSchema } from '../../../../src/schemas/storage.schema';

describe('StorageConfig Schema', () => {
    it('should validate empty input and set defaults', () => {
        const result = storageConfigSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.STORAGE_PROVIDER).toBe('local');
            expect(result.data.B2_BUCKET_PRIVATE).toBe('nestlancer-private');
        }
    });

    it('should strictly respect allowed providers enum', () => {
        const result = storageConfigSchema.safeParse({ STORAGE_PROVIDER: 'invalid-provider' });
        expect(result.success).toBe(false);
    });

    it('should validate with valid provider overrides', () => {
        const result = storageConfigSchema.safeParse({ STORAGE_PROVIDER: 's3' });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.STORAGE_PROVIDER).toBe('s3');
        }
    });
});
