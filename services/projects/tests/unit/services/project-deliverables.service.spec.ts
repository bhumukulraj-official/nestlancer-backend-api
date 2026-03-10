import { ProjectDeliverablesService } from '../../../src/services/project-deliverables.service';

describe('ProjectDeliverablesService', () => {
  let service: ProjectDeliverablesService;
  let mockPrismaWrite: any;
  let mockPrismaRead: any;
  let mockStorage: any;

  beforeEach(() => {
    mockPrismaRead = {
      project: { findFirst: jest.fn().mockResolvedValue({ id: 'proj-1', userId: 'user-1' }) },
      milestone: { findMany: jest.fn().mockResolvedValue([{ id: 'ms-1' }, { id: 'ms-2' }]) },
      deliverable: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'd1', status: 'APPROVED', milestoneId: 'ms-1', createdAt: new Date() },
          { id: 'd2', status: 'PENDING', milestoneId: 'ms-1', createdAt: new Date() },
          { id: 'd3', status: 'IN_PROGRESS', milestoneId: 'ms-2', createdAt: new Date() },
        ]),
      },
    };
    mockPrismaWrite = {};
    mockStorage = {};
    service = new ProjectDeliverablesService(mockPrismaWrite, mockPrismaRead, mockStorage);
  });

  describe('getDeliverables', () => {
    it('should return deliverables with counts', async () => {
      const result = await service.getDeliverables('user-1', 'proj-1');
      expect(result.total).toBe(3);
      expect(result.completed).toBe(1);
      expect(result.pending).toBe(2);
      expect(result.items).toHaveLength(3);
    });

    it('should throw for non-existent project', async () => {
      mockPrismaRead.project.findFirst.mockResolvedValue(null);
      await expect(service.getDeliverables('user-1', 'invalid')).rejects.toThrow();
    });
  });
});
