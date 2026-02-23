import { registerAs } from '@nestjs/config';

export const notificationWorkerConfig = registerAs('notification-worker', () => ({
    rabbitmq: {
        url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
        queue: 'notification.queue',
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
        pubsubPrefix: process.env.REDIS_PUBSUB_PREFIX || 'ws:',
    },
    vapid: {
        publicKey: process.env.VAPID_PUBLIC_KEY,
        privateKey: process.env.VAPID_PRIVATE_KEY,
        subject: process.env.VAPID_SUBJECT || 'mailto:hello@nestlancer.com',
    },
    sms: {
        provider: process.env.SMS_PROVIDER || 'twilio',
        twilio: {
            accountSid: process.env.TWILIO_ACCOUNT_SID,
            authToken: process.env.TWILIO_AUTH_TOKEN,
            fromNumber: process.env.TWILIO_FROM_NUMBER,
        },
    },
    concurrency: parseInt(process.env.NOTIFICATION_CONCURRENCY || '10', 10),
}));
