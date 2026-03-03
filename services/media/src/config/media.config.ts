export const MediaConfig = {
    S3_PRIVATE_BUCKET: process.env.S3_PRIVATE_BUCKET || 'nestlancer-private',
    S3_PUBLIC_BUCKET: process.env.S3_PUBLIC_BUCKET || 'nestlancer-public',
    CLAMAV_HOST: process.env.CLAMAV_HOST || 'clamav',
    CLAMAV_PORT: parseInt(process.env.CLAMAV_PORT || '3310', 10),
    CDN_DOMAIN: process.env.CDN_DOMAIN || 'cdn.nestlancer.com',
    PRESIGNED_URL_EXPIRY: 3600, // 1 hour
};
