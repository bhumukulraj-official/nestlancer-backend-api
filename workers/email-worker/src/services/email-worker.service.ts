import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '@nestlancer/mail';
import { EmailJob } from '../interfaces/email-job.interface';
import { EmailRendererService } from './email-renderer.service';
import { EmailRetryService } from './email-retry.service';
import { ConfigService } from '@nestjs/config';

/**
 * Orchestrator service for the Email Worker.
 * Handles template selection, rendering, and dispatching emails via SMTP.
 * Implements a retry mechanism for failed delivery attempts.
 */
@Injectable()
export class EmailWorkerService {
    private readonly logger = new Logger(EmailWorkerService.name);

    constructor(
        private readonly mailService: MailService,
        private readonly emailRenderer: EmailRendererService,
        private readonly configService: ConfigService,
        private readonly retryService: EmailRetryService,
    ) { }

    /**
     * Processes a single email job from the queue.
     * Renders the appropriate template, determines the subject, and sends the mail.
     * 
     * @param job - The email job payload containing recipient and data
     * @returns A promise that resolves when the email is sent or scheduled for retry
     */
    async processEmail(job: EmailJob): Promise<void> {
        const { type, to, data, attachments } = job;
        this.logger.log(`[EmailWorker] Processing notification: Type=${type} | To=${to}`);

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

            this.logger.log(`[EmailWorker] Successfully sent email: ${type} -> ${to}`);
        } catch (error: any) {
            this.logger.error(`[EmailWorker] Failed to deliver email ${type} to ${to}: ${error.message}`, error.stack);
            await this.retryService.handleFailure(
                this.configService.get('email-worker.rabbitmq.queue') || 'email.queue',
                job,
                error,
            );
        }
    }

    /**
     * Aggregates common data required by almost all email templates.
     * 
     * @returns An object containing common template variables
     */
    private getCommonData(): Record<string, any> {
        return {
            currentYear: new Date().getFullYear(),
            companyName: this.configService.get('email-worker.from.name'),
            supportEmail: this.configService.get('email-worker.from.email'),
            logoUrl: `${this.configService.get('email-worker.frontendUrl')}/logo.png`,
        };
    }

    /**
     * Maps email job types to human-readable subject lines.
     * 
     * @param type - The EmailJobType string
     * @param data - Job data, used for dynamic subject lines (e.g., project name)
     * @returns A string representing the email subject
     */
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
