import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigModule } from '@nestlancer/config';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from '@nestlancer/database';
import { QueueModule } from '@nestlancer/queue';
import { LoggerModule } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule } from '@nestlancer/tracing';
import webhookConfig from './config/webhook-worker.config';
import { WebhookWorkerService } from './services/webhook-worker.service';
import { SignatureVerifierService } from './services/signature-verifier.service';
import { WebhookLoggerService } from './services/webhook-logger.service';
import { WebhookConsumer } from './consumers/webhook.consumer';
import { OutgoingWebhookProcessor } from './processors/outgoing-webhook.processor';
import { RazorpayWebhookProcessor } from './processors/razorpay-webhook.processor';
import { GithubWebhookProcessor } from './processors/github-webhook.processor';
import { GenericWebhookProcessor } from './processors/generic-webhook.processor';
import { PaymentCapturedHandler } from './handlers/razorpay/payment-captured.handler';
import { PaymentFailedHandler } from './handlers/razorpay/payment-failed.handler';
import { RefundProcessedHandler } from './handlers/razorpay/refund-processed.handler';
import { DisputeCreatedHandler } from './handlers/razorpay/dispute-created.handler';
import { GithubPushHandler } from './handlers/github/push.handler';
import { GithubPullRequestHandler } from './handlers/github/pull-request.handler';
import { GithubDeploymentHandler } from './handlers/github/deployment.handler';

@Module({
  imports: [
    ConfigModule.forRoot(),
    NestConfigModule.forFeature(webhookConfig),
    HttpModule,
    DatabaseModule.forRoot(),
    QueueModule.forRoot(),
    LoggerModule.forRoot(),
    MetricsModule,
    TracingModule.forRoot(),
  ],
  providers: [
    WebhookWorkerService,
    SignatureVerifierService,
    WebhookLoggerService,
    WebhookConsumer,
    OutgoingWebhookProcessor,
    RazorpayWebhookProcessor,
    GithubWebhookProcessor,
    GenericWebhookProcessor,
    PaymentCapturedHandler,
    PaymentFailedHandler,
    RefundProcessedHandler,
    DisputeCreatedHandler,
    GithubPushHandler,
    GithubPullRequestHandler,
    GithubDeploymentHandler,
  ],
})
export class AppModule {}
