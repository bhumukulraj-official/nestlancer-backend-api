import { Test, TestingModule } from '@nestjs/testing';
import { ContactSubmissionService } from '../../src/services/contact-submission.service';
import { PrismaWriteService } from '@nestlancer/database';
import { CacheService } from '@nestlancer/cache';
import { QueuePublisherService } from '@nestlancer/queue';
import { TurnstileService } from '@nestlancer/turnstile';
import { SpamFilterService } from '../../src/services/spam-filter.service';
import { RateLimitException } from '@nestlancer/common';
import { ContactSubject } from '@nestlancer/common';

describe('ContactSubmissionService', () => {
    let service: ContactSubmissionService;
    let cacheService: any;
    let turnstileService: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ContactSubmissionService,
                { provide: PrismaWriteService, useValue: { contactMessage: { create: jest.fn().mockResolvedValue({ id: '1' }), update: jest.fn() }, $transaction: jest.fn() } },
                { provide: CacheService, useValue: { increment: jest.fn().mockResolvedValue(1), set: jest.fn() } },
                { provide: QueuePublisherService, useValue: { publish: jest.fn() } },
                { provide: TurnstileService, useValue: { verify: jest.fn().mockResolvedValue(true) } },
                { provide: SpamFilterService, useValue: { checkSpam: jest.fn().mockReturnValue({ isSpam: false, score: 0, reasons: [] }) } },
            ],
        }).compile();

        service = module.get<ContactSubmissionService>(ContactSubmissionService);
        cacheService = module.get<CacheService>(CacheService);
        turnstileService = module.get<TurnstileService>(TurnstileService);
    });

    it('should successfully submit contact', async () => {
        const result = await service.submit({
            name: 'Test Name',
            email: 'test@example.com',
            subject: ContactSubject.SUPPORT,
            message: 'Hello World',
            turnstileToken: 'dummy-token'
        }, '127.0.0.1');

        expect(result).toHaveProperty('ticketId');
    });

    it('should throw Error if turnstile fails', async () => {
        turnstileService.verify.mockResolvedValue(false);
        await expect(service.submit({
            name: 'Test', email: 'a@a.com', subject: ContactSubject.SUPPORT, message: 'test', turnstileToken: 'invalid'
        }, '127.0.0.1')).rejects.toThrow();
    });

    it('should throw RateLimitException if count > limit', async () => {
        cacheService.increment.mockResolvedValue(4);
        await expect(service.submit({
            name: 'Test', email: 'a@a.com', subject: ContactSubject.SUPPORT, message: 'test', turnstileToken: 't'
        }, '127.0.0.1')).rejects.toThrow();
    });
});
