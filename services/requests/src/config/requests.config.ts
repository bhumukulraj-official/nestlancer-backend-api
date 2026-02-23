import { registerAs } from '@nestjs/config';

export default registerAs('requestsService', () => ({
    attachments: {
        maxSize: parseInt(process.env.ATTACHMENT_MAX_SIZE || '10485760', 10), // 10MB limit
        maxCount: parseInt(process.env.ATTACHMENT_MAX_COUNT || '10', 10),
        allowedMimeTypes: [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/csv',
        ],
        s3Bucket: process.env.ATTACHMENT_S3_BUCKET || 'nestlancer-requests',
    },
    quotes: {
        defaultExpirationDays: parseInt(process.env.QUOTE_EXPIRATION_DAYS || '14', 10),
    }
}));
