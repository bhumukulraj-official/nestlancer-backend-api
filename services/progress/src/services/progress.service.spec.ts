import { Test, TestingModule } from '@nestjs/testing';
import { ProgressService } from './progress.service';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { OutboxService } from '@nestlancer/outbox';
import { ProgressEntryType, Visibility } from '../interfaces/progress.interface';

describe('ProgressService', () => {
    let service: ProgressService;

    const mockPrismaWriteService = {
        progressEntry: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };

    const mockPrismaReadService = {
        progressEntry: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
        },
        milestone: {
            findMany: jest.fn(),
        },
    };

    const mockOutboxService = {
        createEvent: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProgressService,
                { provide: PrismaWriteService, useValue: mockPrismaWriteService },
                { provide: PrismaReadService, useValue: mockPrismaReadService },
                { provide: OutboxService, useValue: mockOutboxService },
            ],
        }).compile();

        service = module.get<ProgressService>(ProgressService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createEntry', () => {
        it('should create a progress entry and outbox event if visible', async () => {
            const mockDto = { type: ProgressEntryType.UPDATE, title: 'Test', description: 'desc', visibility: Visibility.CLIENT_VISIBLE };

            mockPrismaWriteService.progressEntry.create.mockResolvedValue({
                id: '1', projectId: 'p1', ...mockDto, clientNotified: true
            });

            const result = await service.createEntry('u1', 'p1', mockDto as any);

            expect(result).toBeDefined();
            expect(mockPrismaWriteService.progressEntry.create).toHaveBeenCalled();
            expect(mockOutboxService.createEvent).toHaveBeenCalled();
        });
    });

    describe('getProjectProgress', () => {
        it('should return paginated progress entries', async () => {
            mockPrismaReadService.progressEntry.findMany.mockResolvedValue([]);
            mockPrismaReadService.progressEntry.count.mockResolvedValue(0);

            const result = await service.getProjectProgress('p1', { page: 1, limit: 10 });

            expect(result.items).toEqual([]);
            expect(result.meta.total).toBe(0);
        });
    });
});
