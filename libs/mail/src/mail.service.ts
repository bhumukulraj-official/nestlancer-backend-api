import { Injectable, Inject, Logger } from '@nestjs/common';
import { MailOptions } from './interfaces/mail.interface';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(@Inject('MAIL_OPTIONS') private readonly options: Record<string, unknown>) {}

  async send(mail: MailOptions): Promise<{ messageId: string }> {
    this.logger.log(`Sending email to ${mail.to}: ${mail.subject}`);
    // In production: uses Resend/SES/SMTP transporter
    return { messageId: `msg-${Date.now()}` };
  }

  async sendTemplate(templateName: string, to: string, variables: Record<string, string>): Promise<{ messageId: string }> {
    this.logger.log(`Sending template '${templateName}' to ${to}`);
    return this.send({ to, subject: templateName, html: JSON.stringify(variables) });
  }
}
