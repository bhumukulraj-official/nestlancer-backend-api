import { ProjectPaymentsService } from '../../../src/services/project-payments.service';

describe('ProjectPaymentsService', () => {
    let service: ProjectPaymentsService;
    let mockPrismaRead: any;

    beforeEach(() => {
        mockPrismaRead = {
            project: { findFirst: jest.fn().mockResolvedValue({ id: 'proj-1', userId: 'user-1', quote: { totalAmount: 10000 } }) },
        };
        service = new ProjectPaymentsService(mockPrismaRead);
    });

    describe('getPayments', () => {
        it('should return payment summary', async () => {
            const result = await service.getPayments('user-1', 'proj-1');
            expect(result.total).toBe(10000);
            expect(result.history).toBeDefined();
        });

        it('should throw for non-existent project', async () => {
            mockPrismaRead.project.findFirst.mockResolvedValue(null);
            await expect(service.getPayments('user-1', 'invalid')).rejects.toThrow();
        });

        it('should handle project without quote', async () => {
            mockPrismaRead.project.findFirst.mockResolvedValue({ id: 'proj-1', quote: null });
            const result = await service.getPayments('user-1', 'proj-1');
            expect(result.total).toBe(0);
        });
    });
});
