import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
        ConfigModule.forRoot({
            isGlobal: true,
            load: [emailWorkerConfig],
        }),
        LoggerModule,
        MetricsModule,
        TracingModule,
        QueueModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                url: config.get('email-worker.rabbitmq.url'),
            }),
        }),
        MailModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                host: config.get('email-worker.smtp.host'),
                port: config.get('email-worker.smtp.port'),
                auth: {
                    user: config.get('email-worker.smtp.user'),
                    pass: config.get('email-worker.smtp.pass'),
                },
                secure: config.get('email-worker.smtp.secure'),
                from: `"${config.get('email-worker.from.name')}" <${config.get('email-worker.from.email')}>`,
            }),
        }),
    ],
    providers: [
        EmailWorkerService,
        EmailRendererService,
        EmailRetryService,
        EmailConsumer,
    ],
})
export class AppModule { }
