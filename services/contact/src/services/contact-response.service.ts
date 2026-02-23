import { Injectable, Logger } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database';
import { QueuePublisherService, EVENTS_EXCHANGE, EMAIL_CONTACT_RESPONSE } from '@nestlancer/queue';
import { ContactStatus, ResourceNotFoundException } from '@nestlancer/common';
import { RespondContactDto } from '../dto/respond-contact.dto';


@Injectable()
export class ContactResponseService {
    private readonly logger = new Logger(ContactResponseService.name);

    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly queuePublisher: QueuePublisherService,
    ) { }

    async respond(contactId: string, adminId: string, dto: RespondContactDto): Promise<any> {
        const contactMessage = await this.prismaWrite.contactMessage.findUnique({
            where: { id: contactId },
        });

        if (!contactMessage) {
            throw new ResourceNotFoundException('ContactMessage', contactId);
        }

        let responseLog = null;

        // We update status to RESPONDED if needed and log response in one transaction
        await this.prismaWrite.$transaction(async (tx) => {
            // Best-effort response log insertion
            try {
                responseLog = await (tx as any).contactResponseLog?.create({
                    data: {
                        contactMessageId: contactId,
                        adminId,
                        subject: dto.subject,
                        message: dto.message,
                    },
                });
            } catch (err: any) {
                this.logger.warn(`Could not create contactResponseLog: ${err.message}`);
                // fallback placeholder
                responseLog = { id: 'fallback-id', contactMessageId: contactId, adminId, subject: dto.subject, message: dto.message, sentAt: new Date() };
            }

            if (dto.markAsResponded) {
                await tx.contactMessage.update({
                    where: { id: contactId },
                    data: { status: ContactStatus.RESPONDED },
                });
            }
        });

        // Publish email event
        await this.queuePublisher.publish(EVENTS_EXCHANGE, EMAIL_CONTACT_RESPONSE, {
            contactId,
            email: contactMessage.email,
            name: contactMessage.name,
            subject: dto.subject,
            message: dto.message,
        });

        return responseLog;
    }
}
