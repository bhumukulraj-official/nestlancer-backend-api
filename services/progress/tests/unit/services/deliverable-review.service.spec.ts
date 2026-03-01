import { DeliverableReviewService } from '../../../src/services/deliverable-review.service';

describe('DeliverableReviewService', () => {
    let service: DeliverableReviewService;
    let mockPrismaWrite: any;
    let mockPrismaRead: any;

    beforeEach(() => {
        mockPrismaRead = {
            deliverable: { findUnique: jest.fn().mockResolvedValue({ id: 'd1', status: 'PENDING' }) },
        };
        mockPrismaWrite = {
            deliverable: { update: jest.fn().mockResolvedValue({ id: 'd1', status: 'APPROVED', approvedAt: new Date() }) },
        };
        service = new DeliverableReviewService(mockPrismaWrite, mockPrismaRead);
    });

    describe('approve', () => {
        it('should approve a pending deliverable', async () => {
            const result = await service.approve('d1', 'user-1', { feedback: 'Good work', rating: 5 } as any);
            expect(result.status).toBe('APPROVED');
        });

        it('should throw for non-existent deliverable', async () => {
            mockPrismaRead.deliverable.findUnique.mockResolvedValue(null);
            await expect(service.approve('invalid', 'user-1', {} as any)).rejects.toThrow();
        });

        it('should throw for already approved deliverable', async () => {
            mockPrismaRead.deliverable.findUnique.mockResolvedValue({ id: 'd1', status: 'APPROVED' });
            await expect(service.approve('d1', 'user-1', {} as any)).rejects.toThrow();
        });
    });

    describe('reject', () => {
        it('should reject a deliverable', async () => {
            mockPrismaWrite.deliverable.update.mockResolvedValue({ id: 'd1', status: 'REJECTED' });
            const result = await service.reject('d1', 'user-1', { reason: 'Quality issues' } as any);
            expect(result.status).toBe('REJECTED');
        });

        it('should throw for non-existent deliverable', async () => {
            mockPrismaRead.deliverable.findUnique.mockResolvedValue(null);
            await expect(service.reject('invalid', 'user-1', {} as any)).rejects.toThrow();
        });
    });
});
