import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '@nestlancer/mail';
import { EmailJob, EmailAttachment } from '../interfaces/email-job.interface';
import { EmailRendererService } from './email-renderer.service';
import { EmailRetryService } from './email-retry.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailWorkerService {
    private readonly logger = new Logger(EmailWorkerService.name);

    constructor(
        private readonly mailService: MailService,
        private readonly emailRenderer: EmailRendererService,
        private readonly configService: ConfigService,
        private readonly retryService: EmailRetryService,
    ) { }

    async processEmail(job: EmailJob): Promise<void> {
        const { type, to, data, attachments } = job;
        this.logger.log(`Processing email of type ${type} to ${to}`);

        try {
            const html = await this.emailRenderer.render(type.toLowerCase(), {
                ...this.getCommonData(),
                ...data,
            });

            const subject = this.getSubjectForType(type, data);

            await this.mailService.send({
                to,
                subject,
                html,
                attachments: attachments as any, // Cast to MailOptions attachments
            });

            this.logger.log(`Email of type ${type} sent to ${to}`);
        } catch (error) {
            this.logger.error(`Failed to process email of type ${type} to ${to}:`, error);
            await this.retryService.handleFailure(
                this.configService.get('email-worker.rabbitmq.queue') || 'email.queue',
                job,
                error,
            );
        }
    }

    private getCommonData() {
        return {
            currentYear: new Date().getFullYear(),
            companyName: this.configService.get('email-worker.from.name'),
            supportEmail: this.configService.get('email-worker.from.email'),
            logoUrl: `${this.configService.get('email-worker.frontendUrl')}/logo.png`,
        };
    }

    private getSubjectForType(type: string, data: any): string {
        switch (type) {
            case 'EMAIL_VERIFICATION':
                return 'Verify your email address';
            case 'PASSWORD_RESET':
                return 'Reset your password';
            case 'WELCOME':
                return 'Welcome to Nestlancer!';
            case 'QUOTE_SENT':
                return 'New Quote Received';
            case 'QUOTE_ACCEPTED':
                return 'Quote Accepted';
            case 'PAYMENT_RECEIVED':
                return 'Payment Received';
            case 'PAYMENT_FAILED':
                return 'Payment Failed';
            case 'PAYMENT_REFUND':
                return 'Refund Processed';
            case 'PROJECT_UPDATE':
                return `Project Update: ${data.projectName}`;
            case 'PROJECT_COMPLETED':
                return `Project Completed: ${data.projectName}`;
            case 'CONTACT_RESPONSE':
                return 'Response to your inquiry';
            case 'ANNOUNCEMENT':
                return data.title || 'System Announcement';
            default:
                return 'Notification from Nestlancer';
        }
    }
}
