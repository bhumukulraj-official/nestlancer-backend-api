import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestlancer/config';
import { LoggerModule } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule } from '@nestlancer/tracing';
import { QueueModule } from '@nestlancer/queue';
import { MailModule } from '@nestlancer/mail';
import { emailWorkerConfig } from './config/email-worker.config';
import { EmailWorkerService } from './services/email-worker.service';
import { EmailRendererService } from './services/email-renderer.service';
import { EmailRetryService } from './services/email-retry.service';
import { EmailConsumer } from './consumers/email.consumer';

@Module({
  imports: [
    ConfigModule.forRoot(),
    NestConfigModule.forFeature(emailWorkerConfig),
    LoggerModule.forRoot(),
    MetricsModule,
    TracingModule.forRoot(),
    QueueModule.forRoot(),
    MailModule.forRoot(),
  ],
  providers: [EmailWorkerService, EmailRendererService, EmailRetryService, EmailConsumer],
})
export class AppModule {}
