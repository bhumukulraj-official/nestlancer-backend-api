import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestlancer/config';
import { DatabaseModule } from '@nestlancer/database';
import { CacheModule } from '@nestlancer/cache';
import { QueueModule } from '@nestlancer/queue';
import { OutboxModule } from '@nestlancer/outbox';
import { AuthLibModule } from '@nestlancer/auth-lib';
import { CryptoModule } from '@nestlancer/crypto';
import { LoggerModule, RequestLoggerMiddleware } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule, CorrelationIdMiddleware } from '@nestlancer/tracing';
import { HealthLibModule } from '@nestlancer/health-lib';
import { AuditModule } from '@nestlancer/audit';
import { StorageModule } from '@nestlancer/storage';
import { MailModule } from '@nestlancer/mail';
import { PdfModule } from '@nestlancer/pdf';
import { SearchModule } from '@nestlancer/search';
import { CircuitBreakerModule } from '@nestlancer/circuit-breaker';

// Proxy infrastructure
import { ProxyModule } from './proxy';

// Domain modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RequestsModule } from './modules/requests/requests.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ProgressModule } from './modules/progress/progress.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { MessagesModule } from './modules/messages/messages.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MediaModule } from './modules/media/media.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { BlogModule } from './modules/blog/blog.module';
import { ContactModule } from './modules/contact/contact.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    // Infrastructure
    ConfigModule,
    ProxyModule,
    DatabaseModule,
    CacheModule,
    QueueModule,
    OutboxModule,
    AuthLibModule,
    CryptoModule,
    LoggerModule,
    MetricsModule,
    TracingModule,
    HealthLibModule,
    AuditModule,
    StorageModule,
    MailModule,
    PdfModule,
    SearchModule,
    CircuitBreakerModule,

    // Domain modules
    AuthModule,
    UsersModule,
    RequestsModule,
    QuotesModule,
    ProjectsModule,
    ProgressModule,
    PaymentsModule,
    MessagesModule,
    NotificationsModule,
    MediaModule,
    PortfolioModule,
    BlogModule,
    ContactModule,
    AdminModule,
    HealthModule,
    WebhooksModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware, RequestLoggerMiddleware).forRoutes('*');
  }
}
