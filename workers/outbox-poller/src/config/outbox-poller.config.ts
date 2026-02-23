import { registerAs } from '@nestjs/config';

export default registerAs('outbox', () => ({
    pollingIntervalMs: parseInt(process.env.POLLING_INTERVAL_MS, 10) || 2000,
    batchSize: parseInt(process.env.BATCH_SIZE, 10) || 100,
    lockTtlSeconds: parseInt(process.env.LOCK_TTL_SECONDS, 10) || 10,
    staleThresholdMinutes: parseInt(process.env.STALE_THRESHOLD_MINUTES, 10) || 60,
    leaderLockKey: process.env.LEADER_LOCK_KEY || 'outbox:poller:lock',
    instanceId: process.env.HOSTNAME || 'outbox-poller-' + Math.random().toString(36).substring(7),
}));
