import { Test, TestingModule } from '@nestjs/testing';
import { MessagingService } from './messaging.service';
import { PrismaWriteService } from '@nestlancer/database/prisma/prisma-write.service';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { OutboxService } from '@nestlancer/outbox';
import { MessageType } from '../interfaces/messaging.interface';

describe('MessagingService', () => {
    let service: MessagingService;

    const mockPrismaWriteService = {
        $transaction: jest.fn(),
    };

    const mockPrismaReadService = {
        message: {
            findMany: jest.fn(),
            count: jest.fn(),
        },
    };

    const mockOutboxService = {
        create: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MessagingService,
                { provide: PrismaWriteService, useValue: mockPrismaWriteService },
                { provide: PrismaReadService, useValue: mockPrismaReadService },
                { provide: OutboxService, useValue: mockOutboxService },
            ],
        }).compile();

        service = module.get<MessagingService>(MessagingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getMessages', () => {
        it('should return paginated messages', async () => {
            mockPrismaReadService.message.findMany.mockResolvedValue([]);
            mockPrismaReadService.message.count.mockResolvedValue(0);

            const result = await service.getMessages('p1', { page: 1, limit: 10 });

            expect(result.items).toEqual([]);
            expect(result.meta.total).toBe(0);
        });
    });
});
