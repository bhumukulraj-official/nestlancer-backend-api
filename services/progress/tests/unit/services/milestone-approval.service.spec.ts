import { MilestoneApprovalService } from '../../../src/services/milestone-approval.service';

describe('MilestoneApprovalService', () => {
    let service: MilestoneApprovalService;
    let mockPrismaWrite: any;
    let mockPrismaRead: any;
    let mockOutbox: any;

    beforeEach(() => {
        mockPrismaRead = {
            milestone: { findUnique: jest.fn().mockResolvedValue({ id: 'ms-1', projectId: 'proj-1', status: 'COMPLETED', name: 'Design' }) },
        };
        mockPrismaWrite = {
            $transaction: jest.fn().mockImplementation(async (fn) => {
                const tx = {
                    milestone: { update: jest.fn().mockResolvedValue({ id: 'ms-1', projectId: 'proj-1', status: 'APPROVED', approvedAt: new Date() }) },
                    progressEntry: { create: jest.fn().mockResolvedValue({}) },
                    outbox: { create: jest.fn().mockResolvedValue({}) },
                };
                return fn(tx);
            }),
        };
        mockOutbox = {};
        service = new MilestoneApprovalService(mockPrismaWrite, mockPrismaRead, mockOutbox);
    });

    describe('approve', () => {
        it('should approve a completed milestone', async () => {
            const result = await service.approve('ms-1', 'user-1', { feedback: 'Looks great' } as any);
            expect(result.status).toBe('APPROVED');
            expect(mockPrismaWrite.$transaction).toHaveBeenCalled();
        });

        it('should throw for non-existent milestone', async () => {
            mockPrismaRead.milestone.findUnique.mockResolvedValue(null);
            await expect(service.approve('invalid', 'user-1', {} as any)).rejects.toThrow();
        });

        it('should throw for non-COMPLETED milestone', async () => {
            mockPrismaRead.milestone.findUnique.mockResolvedValue({ id: 'ms-1', status: 'PENDING' });
            await expect(service.approve('ms-1', 'user-1', {} as any)).rejects.toThrow();
        });
    });

    describe('requestRevision', () => {
        it('should request revision on completed milestone', async () => {
            mockPrismaWrite.$transaction.mockImplementation(async (fn: any) => {
                const tx = {
                    milestone: { update: jest.fn().mockResolvedValue({ id: 'ms-1', projectId: 'proj-1', status: 'REVISION_REQUESTED' }) },
                    progressEntry: { create: jest.fn().mockResolvedValue({}) },
                    outbox: { create: jest.fn().mockResolvedValue({}) },
                };
                return fn(tx);
            });

            const result = await service.requestRevision('ms-1', 'user-1', { reason: 'Needs more work' } as any);
            expect(result.status).toBe('REVISION_REQUESTED');
        });

        it('should throw for non-COMPLETED milestone', async () => {
            mockPrismaRead.milestone.findUnique.mockResolvedValue({ id: 'ms-1', status: 'PENDING' });
            await expect(service.requestRevision('ms-1', 'user-1', { reason: 'test' } as any))
                .rejects.toThrow();
        });
    });
});
