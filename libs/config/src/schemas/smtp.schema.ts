import { z } from 'zod';

export const smtpConfigSchema = z.object({
    EMAIL_PROVIDER: z.enum(['smtp', 'zeptomail', 'ses']).default('smtp'),
    SMTP_HOST: z.string().default('localhost'),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_SECURE: z.string().transform(v => v === 'true').default('false'),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    ZEPTOMAIL_URL: z.string().optional(),
    ZEPTOMAIL_TOKEN: z.string().optional(),
    SES_REGION: z.string().default('us-east-1'),
    SES_ACCESS_KEY: z.string().optional(),
    SES_SECRET_KEY: z.string().optional(),
    SES_FROM_EMAIL: z.string().default('noreply@localhost'),
});

export type SmtpConfig = z.infer<typeof smtpConfigSchema>;
