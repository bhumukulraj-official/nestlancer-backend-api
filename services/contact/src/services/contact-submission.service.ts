import { Injectable, Logger } from '@nestjs/common';
import { RateLimitException, ContactStatus, generateShortId } from '@nestlancer/common';
import { PrismaWriteService } from '@nestlancer/database';
import { CacheService } from '@nestlancer/cache';
import { QueuePublisherService, EVENTS_EXCHANGE, NOTIFICATION_SYSTEM } from '@nestlancer/queue';
import { TurnstileService } from '@nestlancer/turnstile';
import { SubmitContactDto } from '../dto/submit-contact.dto';
import { SpamFilterService } from './spam-filter.service';
import { contactConfig } from '../config/contact.config';

@Injectable()
export class ContactSubmissionService {
    private readonly logger = new Logger(ContactSubmissionService.name);

    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly cacheService: CacheService,
        private readonly turnstileService: TurnstileService,
        private readonly spamFilterService: SpamFilterService,
        private readonly queuePublisher: QueuePublisherService,
    ) { }

    async submit(dto: SubmitContactDto, ip: string): Promise<{ ticketId: string }> {
        // 1. Rate Limit
        const rateLimitKey = `ratelimit:contact:${ip}`;
        const currentCount = await this.cacheService.increment(rateLimitKey);
        if (currentCount === 1) {
            await this.cacheService.set(rateLimitKey, 1, contactConfig.RATE_LIMIT_TTL_HOURS * 3600);
        }
        if (currentCount > contactConfig.RATE_LIMIT_PER_IP) {
            throw new RateLimitException(`Rate limit exceeded for contact form`, contactConfig.RATE_LIMIT_TTL_HOURS * 3600);
        }

        // 2. Turnstile Validation
        try {
            const turnstileValid = await this.turnstileService.verify(dto.turnstileToken, ip);
            if (!turnstileValid) {
                // Business logic exception or specific code
                throw new Error('Turnstile verification failed');
            }
        } catch (error: any) {
            this.logger.warn(`Turnstile validation failed for IP ${ip}: ${error.message}`);
            throw new Error('Verification failed format'); // Or a proper custom exception e.g. BusinessLogicException
        }

        // 3. Spam Check
        const spamCheck = this.spamFilterService.checkSpam(dto.email, dto.message);
        const resolvedStatus = spamCheck.isSpam ? ContactStatus.SPAM : ContactStatus.NEW;

        // 4. Create Contact Message
        const message = await this.prismaWrite.contactMessage.create({
            data: {
                name: dto.name,
                email: dto.email,
                subject: dto.subject as any,
                message: dto.message,
                status: resolvedStatus as any,
                ip: ip,
                turnstileVerified: true,
            }
        });

        const ticketId = message.id;

        // 6. Notify Admin via queue
        if (!spamCheck.isSpam) {
            await this.queuePublisher.publish(EVENTS_EXCHANGE, NOTIFICATION_SYSTEM, {
                category: 'SYSTEM',
                type: 'INFO',
                title: 'New Contact Submission',
                message: `New message from ${dto.name} (${dto.email}) about ${dto.subject}`,
                data: { contactId: message.id, ticketId },
            });
        }

        return { ticketId };
    }
}
