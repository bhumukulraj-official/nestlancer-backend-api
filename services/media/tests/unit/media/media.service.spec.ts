import { MediaService } from '../../../src/media/media.service';

describe('MediaService', () => {
    let service: MediaService;
    let mockPrismaWrite: any;
    let mockPrismaRead: any;
    let mockStorageService: any;

    const mockMedia = { id: 'm-1', userId: 'user-1', filename: 'test.png', mimeType: 'image/png', size: 1024, status: 'READY', storageKey: 'users/user-1/2025-01-01/uuid.png', customMetadata: {}, createdAt: new Date() };

    beforeEach(() => {
        mockPrismaRead = {
            media: {
                findMany: jest.fn().mockResolvedValue([mockMedia]),
                count: jest.fn().mockResolvedValue(1),
                findFirst: jest.fn().mockResolvedValue(mockMedia),
                aggregate: jest.fn().mockResolvedValue({ _sum: { size: 1024 }, _count: 1 }),
            },
        };
        mockPrismaWrite = {
            media: {
                create: jest.fn().mockResolvedValue(mockMedia),
                findFirst: jest.fn().mockResolvedValue(mockMedia),
                update: jest.fn().mockResolvedValue({ ...mockMedia, status: 'READY' }),
                delete: jest.fn().mockResolvedValue(mockMedia),
            },
        };
        mockStorageService = {
            generateStorageKey: jest.fn().mockReturnValue('users/user-1/2025-01-01/uuid.png'),
            generatePresignedUploadUrl: jest.fn().mockResolvedValue('https://s3.example.com/upload'),
            generatePresignedDownloadUrl: jest.fn().mockResolvedValue('https://s3.example.com/download'),
            upload: jest.fn().mockResolvedValue(undefined),
            deleteFile: jest.fn().mockResolvedValue(undefined),
        };
        service = new MediaService(mockPrismaWrite, mockPrismaRead, mockStorageService);
    });

    describe('findByUser', () => {
        it('should return paginated media', async () => {
            const result = await service.findByUser('user-1', { page: 1, limit: 20 } as any);
            expect(result.data).toHaveLength(1);
        });
    });

    describe('requestUpload', () => {
        it('should create media record and return upload URL', async () => {
            const result = await service.requestUpload('user-1', { filename: 'test.png', mimeType: 'image/png', size: 1024, fileType: 'IMAGE' } as any);
            expect(result.mediaId).toBe('m-1');
            expect(result.uploadUrl).toBeDefined();
        });
    });

    describe('confirmUpload', () => {
        it('should confirm pending upload', async () => {
            const result = await service.confirmUpload('user-1', { uploadId: 'm-1' } as any);
            expect(result.status).toBe('READY');
        });

        it('should throw for non-existent upload', async () => {
            mockPrismaWrite.media.findFirst.mockResolvedValue(null);
            await expect(service.confirmUpload('user-1', { uploadId: 'invalid' } as any)).rejects.toThrow();
        });
    });

    describe('getStorageStats', () => {
        it('should return storage statistics', async () => {
            const result = await service.getStorageStats('user-1');
            expect(result.totalUsedBytes).toBe(1024);
            expect(result.quotaBytes).toBe(5 * 1024 * 1024 * 1024);
        });
    });

    describe('findById', () => {
        it('should return media by id', async () => {
            const result = await service.findById('m-1', 'user-1');
            expect(result.id).toBe('m-1');
        });

        it('should throw for non-existent media', async () => {
            mockPrismaRead.media.findFirst.mockResolvedValue(null);
            await expect(service.findById('invalid', 'user-1')).rejects.toThrow();
        });
    });

    describe('delete', () => {
        it('should delete media and storage file', async () => {
            await service.delete('m-1', 'user-1');
            expect(mockStorageService.deleteFile).toHaveBeenCalled();
            expect(mockPrismaWrite.media.delete).toHaveBeenCalled();
        });
    });

    describe('getDownloadUrl', () => {
        it('should return presigned download URL', async () => {
            const result = await service.getDownloadUrl('m-1', 'user-1');
            expect(result.downloadUrl).toBeDefined();
            expect(result.expiresIn).toBe(3600);
        });
    });
});
