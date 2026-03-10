import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigModule } from '@nestlancer/config';
import { LoggerModule } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule } from '@nestlancer/tracing';
import { DatabaseModule } from '@nestlancer/database';
import { QueueModule } from '@nestlancer/queue';
import { OutboxModule } from '@nestlancer/outbox';
import { CacheModule } from '@nestlancer/cache';
import { AuthLibModule } from '@nestlancer/auth-lib';
import { StorageModule } from '@nestlancer/storage';

import { QuotesController } from './controllers/quotes.controller';
import { QuotesAdminController } from './controllers/quotes.admin.controller';
import { QuotesService } from './services/quotes.service';
import { QuotesAdminService } from './services/quotes.admin.service';
import { QuoteStatusService } from './services/quote-status.service';
import { QuotePdfService } from './services/quote-pdf.service';
import { QuoteStatsService } from './services/quote-stats.service';

import quotesConfig from './config/quotes.config';

@Module({
    imports: [
        ConfigModule.forRoot(),
        NestConfigModule.forFeature(quotesConfig),
        LoggerModule.forRoot(),
        MetricsModule,
        TracingModule.forRoot(),
        DatabaseModule.forRoot(),
        QueueModule.forRoot(),
        OutboxModule.forRoot(),
        CacheModule.forRoot(),
        AuthLibModule,
        StorageModule.forRoot(),
    ],
    controllers: [QuotesController, QuotesAdminController],
    providers: [
        QuotesService,
        QuotesAdminService,
        QuoteStatusService,
        QuotePdfService,
        QuoteStatsService,
    ],
})
export class AppModule { }
