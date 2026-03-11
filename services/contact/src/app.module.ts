import { Module } from '@nestjs/common';
import { NestlancerConfigModule } from '@nestlancer/config';
import { LoggerModule } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule } from '@nestlancer/tracing';
import { CacheModule } from '@nestlancer/cache';
import { DatabaseModule } from '@nestlancer/database';
import { QueueModule } from '@nestlancer/queue';
import { AuthLibModule } from '@nestlancer/auth-lib';
import { TurnstileModule } from '@nestlancer/turnstile';
import { ContactPublicController } from './controllers/public/contact.public.controller';
import { ContactAdminController } from './controllers/admin/contact.admin.controller';
import { ContactService } from './services/contact.service';
import { ContactSubmissionService } from './services/contact-submission.service';
import { ContactResponseService } from './services/contact-response.service';
import { SpamFilterService } from './services/spam-filter.service';
import { ContactAdminService } from './services/contact-admin.service';

@Module({
  imports: [
    NestlancerConfigModule.forRoot(),
    LoggerModule.forRoot(),
    MetricsModule,
    TracingModule.forRoot(),
    DatabaseModule.forRoot(),
    CacheModule.forRoot(),
    QueueModule.forRoot(),
    AuthLibModule,
    TurnstileModule.forRoot(),
  ],
  controllers: [ContactPublicController, ContactAdminController],
  providers: [
    ContactService,
    ContactSubmissionService,
    ContactResponseService,
    SpamFilterService,
    ContactAdminService,
  ],
})
export class AppModule {}
