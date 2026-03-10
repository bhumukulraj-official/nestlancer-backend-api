import { ProgressService } from '../../../src/services/progress.service';

describe('ProgressService', () => {
  let service: ProgressService;
  let mockPrismaWrite: any;
  let mockPrismaRead: any;
  let mockOutbox: any;

  beforeEach(() => {
    mockPrismaRead = {
      progressEntry: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            {
              id: 'pe-1',
              type: 'UPDATE',
              title: 'Progress',
              projectId: 'proj-1',
              createdAt: new Date(),
            },
          ]),
        count: jest.fn().mockResolvedValue(1),
        findUnique: jest.fn().mockResolvedValue({ id: 'pe-1', type: 'UPDATE', title: 'Progress' }),
      },
      milestone: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'ms-1', status: 'COMPLETED', name: 'Design' },
          { id: 'ms-2', status: 'IN_PROGRESS', name: 'Development' },
          { id: 'ms-3', status: 'PENDING', name: 'Testing' },
        ]),
      },
    };
    mockPrismaWrite = {
      progressEntry: {
        create: jest.fn().mockResolvedValue({
          id: 'pe-new',
          projectId: 'proj-1',
          type: 'UPDATE',
          title: 'New Update',
          visibility: 'CLIENT_VISIBLE',
          clientNotified: true,
        }),
        update: jest.fn().mockResolvedValue({ id: 'pe-1', title: 'Updated Title' }),
        delete: jest.fn().mockResolvedValue({}),
      },
    };
    mockOutbox = { createEvent: jest.fn().mockResolvedValue({}) };
    service = new ProgressService(mockPrismaWrite, mockPrismaRead, mockOutbox);
  });

  describe('createEntry', () => {
    it('should create a progress entry', async () => {
      const dto = {
        type: 'UPDATE',
        title: 'New Update',
        description: 'Details',
        visibility: 'CLIENT_VISIBLE',
        notifyClient: true,
      };
      const result = await service.createEntry('user-1', 'proj-1', dto as any);
      expect(result.id).toBe('pe-new');
      expect(mockPrismaWrite.progressEntry.create).toHaveBeenCalled();
    });

    it('should emit outbox event for client-visible entries', async () => {
      const dto = { type: 'UPDATE', title: 'New Update', description: 'Details' };
      await service.createEntry('user-1', 'proj-1', dto as any);
      expect(mockOutbox.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'PROGRESS_ENTRY_CREATED' }),
      );
    });
  });

  describe('getProjectProgress', () => {
    it('should return paginated progress entries', async () => {
      const result = await service.getProjectProgress('proj-1', { page: 1, limit: 20 } as any);
      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by type', async () => {
      await service.getProjectProgress('proj-1', { page: 1, limit: 20, type: 'MILESTONE' } as any);
      expect(mockPrismaRead.progressEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ type: 'MILESTONE' }) }),
      );
    });
  });

  describe('getEntryById', () => {
    it('should return a single entry', async () => {
      const result = await service.getEntryById('pe-1');
      expect(result.id).toBe('pe-1');
    });

    it('should throw for non-existent entry', async () => {
      mockPrismaRead.progressEntry.findUnique.mockResolvedValue(null);
      await expect(service.getEntryById('invalid')).rejects.toThrow();
    });
  });

  describe('updateEntry', () => {
    it('should update entry fields', async () => {
      const result = await service.updateEntry('pe-1', { title: 'Updated Title' } as any);
      expect(result.title).toBe('Updated Title');
    });
  });

  describe('deleteEntry', () => {
    it('should delete entry', async () => {
      const result = await service.deleteEntry('pe-1');
      expect(result.success).toBe(true);
    });
  });

  describe('getStatusSummary', () => {
    it('should return percentage and current phase', async () => {
      const result = await service.getStatusSummary('proj-1');
      expect(result.percentageComplete).toBe(33); // 1 of 3 completed
      expect(result.currentPhase).toBe('Development');
    });

    it('should return 0% for projects with no milestones', async () => {
      mockPrismaRead.milestone.findMany.mockResolvedValue([]);
      const result = await service.getStatusSummary('proj-1');
      expect(result.percentageComplete).toBe(0);
      expect(result.currentPhase).toBe('Not Started');
    });
  });
});
