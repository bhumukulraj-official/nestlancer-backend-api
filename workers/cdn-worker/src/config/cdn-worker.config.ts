import { registerAs } from '@nestjs/config';

export default registerAs('cdn', () => ({
  provider: process.env.CDN_PROVIDER || 'cloudflare',
  batchWindowMs: parseInt(process.env.BATCH_WINDOW_MS || '', 10) || 10000,
  maxBatchSize: parseInt(process.env.MAX_BATCH_SIZE || '', 10) || 30,
  retryOnRateLimit: process.env.RETRY_ON_RATE_LIMIT === 'true',
  cloudflare: {
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    zoneId: process.env.CLOUDFLARE_ZONE_ID,
  },
  cloudfront: {
    distributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
    region: process.env.AWS_REGION || 'ap-south-1',
  },
}));
