export enum EmailJobType {
    VERIFICATION = 'EMAIL_VERIFICATION',
    PASSWORD_RESET = 'PASSWORD_RESET',
    WELCOME = 'WELCOME',
    NOTIFICATION = 'NOTIFICATION',
    QUOTE_SENT = 'QUOTE_SENT',
    QUOTE_ACCEPTED = 'QUOTE_ACCEPTED',
    PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
    PAYMENT_REFUND = 'PAYMENT_REFUND',
    PROJECT_UPDATE = 'PROJECT_UPDATE',
    PROJECT_COMPLETED = 'PROJECT_COMPLETED',
    CONTACT_RESPONSE = 'CONTACT_RESPONSE',
    ANNOUNCEMENT = 'ANNOUNCEMENT',
}

export interface EmailAttachment {
    filename: string;
    content: string | Buffer;
    contentType?: string;
    encoding?: string;
    path?: string;
    cid?: string;
}

export interface EmailJob {
    type: EmailJobType;
    to: string;
    data: Record<string, any>;
    attachments?: EmailAttachment[];
    priority?: number;
}
