import { registerAs } from '@nestjs/config';

export const notificationWorkerConfig = registerAs('notificationWorker', () => ({
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    queue: 'notification.queue',
  },
  redis: {
    host: process.env.NOTIFICATION_WORKER_REDIS_HOST || 'localhost',
    port: parseInt(process.env.NOTIFICATION_WORKER_REDIS_PORT || '6379', 10),
    password: process.env.NOTIFICATION_WORKER_REDIS_PASSWORD,
    pubsubPrefix: process.env.REDIS_PUBSUB_PREFIX || 'ws:',
  },
  vapid: {
    publicKey: process.env.NOTIFICATION_WORKER_VAPID_PUBLIC_KEY,
    privateKey: process.env.NOTIFICATION_WORKER_VAPID_PRIVATE_KEY,
    subject: process.env.NOTIFICATION_WORKER_VAPID_SUBJECT || 'mailto:hello@nestlancer.com',
  },
  concurrency: parseInt(process.env.NOTIFICATION_CONCURRENCY || '10', 10),
}));
