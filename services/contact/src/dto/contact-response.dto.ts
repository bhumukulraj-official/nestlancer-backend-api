import { ContactStatus, ContactSubject } from '@nestlancer/common';
import { ContactResponseLog } from '../entities/contact-response-log.entity';

export class ContactMessageResponseDto {
    id: string;
    name: string;
    email: string;
    subject: ContactSubject;
    message: string;
    status: ContactStatus;
    spamScore?: number;
    responses: ContactResponseLog[];
    createdAt: Date;
    updatedAt: Date;
}
