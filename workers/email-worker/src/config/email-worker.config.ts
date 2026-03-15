import { registerAs } from '@nestjs/config';

export const emailWorkerConfig = registerAs('emailWorker', () => ({
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    queue: 'email.queue',
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    secure: process.env.SMTP_SECURE === 'true',
  },
  from: {
    email: process.env.FROM_EMAIL || 'hello@nestlancer.com',
    name: process.env.FROM_NAME || 'Nestlancer',
  },
  replyTo: process.env.REPLY_TO,
  concurrency: parseInt(process.env.EMAIL_CONCURRENCY || '5', 10),
  templatesPath: process.env.TEMPLATES_PATH || './src/templates',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
}));
