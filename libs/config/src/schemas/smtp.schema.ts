import { z } from 'zod';

export const smtpConfigSchema = z.object({
  EMAIL_PROVIDER: z.enum(['smtp', 'zeptomail']).default('smtp'),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  ZEPTOMAIL_URL: z.string().optional(),
  ZEPTOMAIL_TOKEN: z.string().optional(),
});

export type SmtpConfig = z.infer<typeof smtpConfigSchema>;
