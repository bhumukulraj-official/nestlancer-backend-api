import { DeliverablesService } from '../../../src/services/deliverables.service';

describe('DeliverablesService', () => {
    let service: DeliverablesService;
    let mockPrismaWrite: any;
    let mockPrismaRead: any;
    let mockStorage: any;

    beforeEach(() => {
        mockPrismaRead = {
            milestone: { findMany: jest.fn().mockResolvedValue([{ id: 'ms-1' }]) },
            deliverable: {
                findMany: jest.fn().mockResolvedValue([
                    { id: 'd1', status: 'PENDING', attachments: ['media-1'], milestoneId: 'ms-1', createdAt: new Date() },
                ])
            },
        };
        mockPrismaWrite = {
            deliverable: {
                create: jest.fn().mockResolvedValue({ id: 'd-new', milestoneId: 'ms-1', name: 'Deliverable Upload', status: 'PENDING' }),
                update: jest.fn().mockResolvedValue({ id: 'd1', description: 'Updated' }),
                delete: jest.fn().mockResolvedValue({}),
            },
        };
        mockStorage = {
            getSignedUrl: jest.fn().mockResolvedValue('https://cdn.example.com/signed-url'),
        };
        service = new DeliverablesService(mockPrismaWrite, mockPrismaRead, mockStorage);
    });

    describe('create', () => {
        it('should create a deliverable', async () => {
            const result = await service.create('proj-1', { milestoneId: 'ms-1', description: 'Test', mediaIds: ['media-1'] } as any);
            expect(result.id).toBe('d-new');
            expect(mockPrismaWrite.deliverable.create).toHaveBeenCalled();
        });
    });

    describe('getProjectDeliverables', () => {
        it('should return deliverables with signed URLs', async () => {
            const result = await service.getProjectDeliverables('proj-1');
            expect(result).toHaveLength(1);
            expect(mockStorage.getSignedUrl).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should update deliverable description', async () => {
            const result = await service.update('d1', { description: 'Updated' } as any);
            expect(result.description).toBe('Updated');
        });
    });

    describe('delete', () => {
        it('should delete deliverable', async () => {
            const result = await service.delete('d1');
            expect(result.success).toBe(true);
        });
    });
});
