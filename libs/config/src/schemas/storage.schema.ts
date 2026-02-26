import { z } from 'zod';

export const storageConfigSchema = z.object({
    STORAGE_PROVIDER: z.enum(['s3', 'b2', 'local']).default('local'),
    B2_KEY_ID: z.string().optional(),
    B2_APPLICATION_KEY: z.string().optional(),
    B2_ENDPOINT: z.string().optional(),
    B2_BUCKET_PRIVATE: z.string().default('nestlancer-private'),
    B2_BUCKET_PUBLIC: z.string().default('nestlancer-public'),
    B2_PRESIGNED_URL_EXPIRY: z.coerce.number().default(3600),
    STORAGE_MAX_FILE_SIZE: z.coerce.number().default(104857600), // 100 MB
    STORAGE_ALLOWED_MIME_TYPES: z.string().default('image/jpeg,image/png,application/pdf'),
    LOCAL_STORAGE_PATH: z.string().default('./data/storage'),
});

export type StorageConfig = z.infer<typeof storageConfigSchema>;
