import { z } from 'zod';

export const storageConfigSchema = z.object({
  STORAGE_PROVIDER: z.enum(['b2', 'local']).default('local'),

  // B2 connection
  B2_KEY_ID: z.string().optional(),
  B2_APPLICATION_KEY: z.string().optional(),
  B2_ENDPOINT: z.string().optional(),
  B2_REGION: z.string().default('eu-central-003'),
  B2_PRESIGNED_URL_EXPIRY: z.coerce.number().default(3600),

  // Canonical bucket names
  STORAGE_BUCKET_PRIVATE: z.string().default('nestlancer-private'),
  STORAGE_BUCKET_PUBLIC: z.string().default('nestlancer-public'),
  STORAGE_BUCKET_AVATARS: z.string().default('nestlancer-avatars'),
  STORAGE_BUCKET_ATTACHMENTS: z.string().default('nestlancer-requests'),
  STORAGE_BUCKET_QUOTES: z.string().default('nestlancer-quotes-pdfs'),
  STORAGE_BUCKET_DELIVERABLES: z.string().default('nestlancer-deliverables'),
  STORAGE_BUCKET_REPORTS: z.string().default('nestlancer-reports'),
  STORAGE_BUCKET_PDFS: z.string().default('nestlancer-pdfs'),

  // Local storage
  LOCAL_STORAGE_PATH: z.string().default('./data/storage'),
  LOCAL_STORAGE_URL: z.string().optional(),

  // Upload constraints
  STORAGE_MAX_FILE_SIZE: z.coerce.number().default(104857600), // 100 MB
  STORAGE_ALLOWED_MIME_TYPES: z.string().default('image/jpeg,image/png,application/pdf'),
});

export type StorageConfig = z.infer<typeof storageConfigSchema>;
