import { registerAs } from '@nestjs/config';

export default registerAs('webhook-worker', () => ({
    outgoingTimeoutMs: parseInt(process.env.OUTGOING_TIMEOUT_MS || '10000', 10),
    maxRetries: parseInt(process.env.WEBHOOK_WORKER_MAX_RETRIES || '5', 10),
    backoffBaseSeconds: parseInt(process.env.BACKOFF_BASE_SECONDS || '10', 10),
    backoffMultiplier: parseInt(process.env.BACKOFF_MULTIPLIER || '3', 10),
}));
