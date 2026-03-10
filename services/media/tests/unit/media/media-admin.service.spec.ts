import { MediaAdminService } from '../../../src/media/media-admin.service';

describe('MediaAdminService', () => {
  let service: MediaAdminService;
  let mockPrismaWrite: any;
  let mockPrismaRead: any;
  let mockStorageService: any;

  beforeEach(() => {
    mockPrismaRead = {
      media: {
        findMany: jest.fn().mockResolvedValue([{ id: 'm-1', status: 'READY' }]),
        count: jest.fn().mockResolvedValue(1),
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'm-1', status: 'READY', metadata: { storageKey: 'key' } }),
        aggregate: jest.fn().mockResolvedValue({ _sum: { size: 5000 } }),
        groupBy: jest.fn().mockResolvedValue([
          { status: 'READY', _count: 3 },
          { mimeType: 'image/png', _count: 3 },
        ]),
      },
    };
    mockPrismaWrite = {
      media: {
        update: jest.fn().mockResolvedValue({ id: 'm-1', status: 'PROCESSING' }),
        delete: jest.fn().mockResolvedValue({}),
      },
    };
    mockStorageService = {
      deleteFile: jest.fn().mockResolvedValue(undefined),
    };
    service = new MediaAdminService(mockPrismaWrite, mockPrismaRead, mockStorageService);
  });

  describe('findAll', () => {
    it('should return paginated media', async () => {
      const result = await service.findAll({ page: 1, limit: 20 } as any);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getAnalytics', () => {
    it('should return storage analytics', async () => {
      const result = await service.getAnalytics();
      expect(result.totalSize).toBe(5000);
      expect(result.byStatus).toHaveLength(2);
    });
  });

  describe('reprocess', () => {
    it('should set status to PROCESSING', async () => {
      const result = await service.reprocess('m-1');
      expect(result.status).toBe('PROCESSING');
    });
  });

  describe('deleteAny', () => {
    it('should delete any media by id', async () => {
      await service.deleteAny('m-1');
      expect(mockPrismaWrite.media.delete).toHaveBeenCalledWith({ where: { id: 'm-1' } });
    });
  });
});
