import { Injectable, Logger } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { QueuePublisherService, EVENTS_EXCHANGE, EMAIL_CONTACT_RESPONSE } from '@nestlancer/queue';
import { ContactStatus, ResourceNotFoundException } from '@nestlancer/common';
import { RespondContactDto } from '../dto/respond-contact.dto';

interface ContactResponseResult {
    id: string;
    contactMessageId: string;
    adminId: string;
    subject: string;
    message: string;
    sentAt: Date;
}

@Injectable()
export class ContactResponseService {
    private readonly logger = new Logger(ContactResponseService.name);

    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly queuePublisher: QueuePublisherService,
    ) { }

    async respond(contactId: string, adminId: string, dto: RespondContactDto): Promise<ContactResponseResult> {
        const contactMessage = await this.prismaRead.contactMessage.findUnique({
            where: { id: contactId },
        });

        if (!contactMessage) {
            throw new ResourceNotFoundException('ContactMessage', contactId);
        }

        // Create response log and update status in one transaction
        const result = await this.prismaWrite.$transaction(async (tx: any) => {
            // Create the response log
            const responseLog = await tx.contactResponseLog.create({
                data: {
                    contactMessageId: contactId,
                    adminId,
                    subject: dto.subject,
                    message: dto.message,
                    sentAt: new Date(),
                },
            });

            // Update contact message status if requested
            if (dto.markAsResponded) {
                await tx.contactMessage.update({
                    where: { id: contactId },
                    data: { status: ContactStatus.RESPONDED },
                });
            }

            return responseLog;
        });

        // Publish email event to send the response to the user
        await this.queuePublisher.publish(EVENTS_EXCHANGE, EMAIL_CONTACT_RESPONSE, {
            contactId,
            email: contactMessage.email,
            name: contactMessage.name,
            subject: dto.subject,
            message: dto.message,
            ticketId: contactMessage.ticketId,
        });

        this.logger.log(`Response sent for contact message ${contactId} by admin ${adminId}`);

        return {
            id: result.id,
            contactMessageId: result.contactMessageId,
            adminId: result.adminId,
            subject: result.subject,
            message: result.message,
            sentAt: result.sentAt,
        };
    }

    async getResponseHistory(contactId: string): Promise<ContactResponseResult[]> {
        const responses = await this.prismaRead.contactResponseLog.findMany({
            where: { contactMessageId: contactId },
            orderBy: { sentAt: 'desc' },
        });

        return responses.map(r => ({
            id: r.id,
            contactMessageId: r.contactMessageId,
            adminId: r.adminId,
            subject: r.subject,
            message: r.message,
            sentAt: r.sentAt,
        }));
    }
}
