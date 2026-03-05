import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestlancer/config';
import { LoggerModule } from '@nestlancer/logger';
import { DatabaseModule } from '@nestlancer/database';
import { AuthLibModule } from '@nestlancer/auth-lib';
import { StorageModule } from '@nestlancer/storage';
import { OutboxModule } from '@nestlancer/outbox';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule } from '@nestlancer/tracing';
import { QueueModule } from '@nestlancer/queue';
import { CacheModule } from '@nestlancer/cache';
import paymentsConfig from './config/payments.config';

import { PaymentsController } from './controllers/user/payments.controller';
import { PaymentMethodsController } from './controllers/user/payment-methods.controller';
import { PaymentsAdminController } from './controllers/admin/payments.admin.controller';
import { PaymentMilestonesAdminController } from './controllers/admin/payment-milestones.admin.controller';
import { PaymentDisputesAdminController } from './controllers/admin/payment-disputes.admin.controller';
import { RazorpayWebhookController } from './controllers/webhooks/razorpay-webhook.controller';

import {
    PaymentsService,
    PaymentIntentService,
    PaymentConfirmationService,
    RazorpayService,
    RefundService,
    RazorpayWebhookService,
    PaymentMethodsService,
    PaymentMilestonesService,
    ReceiptPdfService,
    InvoicePdfService,
    PaymentDisputesService,
    PaymentReconciliationService,
    PaymentStatsService
} from './services';

@Module({
    imports: [
        ConfigModule,
        LoggerModule,
        MetricsModule,
        TracingModule,
        DatabaseModule.forRoot(),
        AuthLibModule,
        StorageModule.forRoot(),
        OutboxModule.forRoot(),
        QueueModule.forRoot(),
        CacheModule.forRoot(),
    ],
    controllers: [
        PaymentsController,
        PaymentMethodsController,
        PaymentsAdminController,
        PaymentMilestonesAdminController,
        PaymentDisputesAdminController,
        RazorpayWebhookController,
    ],
    providers: [
        PaymentsService,
        PaymentIntentService,
        PaymentConfirmationService,
        RazorpayService,
        RefundService,
        RazorpayWebhookService,
        PaymentMethodsService,
        PaymentMilestonesService,
        ReceiptPdfService,
        InvoicePdfService,
        PaymentDisputesService,
        PaymentReconciliationService,
        PaymentStatsService,
    ],
})
export class AppModule { }
