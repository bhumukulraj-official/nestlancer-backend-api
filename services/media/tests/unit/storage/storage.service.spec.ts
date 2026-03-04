import { StorageService } from '../../../src/storage/storage.service';

describe('StorageService', () => {
    let service: StorageService;
    let mockS3: any;

    beforeEach(() => {
        mockS3 = {
            getSignedUrl: jest.fn().mockResolvedValue('https://s3.example.com/url'),
            upload: jest.fn().mockResolvedValue({}),
            delete: jest.fn().mockResolvedValue(undefined),
        };
        service = new StorageService(mockS3);
    });

    describe('generateStorageKey', () => {
        it('should generate a structured key', () => {
            const key = service.generateStorageKey('user-1', 'photo.png');
            expect(key).toContain('users/user-1/');
            expect(key).toContain('.png');
        });
    });

    describe('generatePresignedUploadUrl', () => {
        it('should call S3 with correct params', async () => {
            const result = await service.generatePresignedUploadUrl('key', 'image/png');
            expect(result).toBe('https://s3.example.com/url');
            expect(mockS3.getSignedUrl).toHaveBeenCalledWith(expect.objectContaining({
                operation: 'put',
                contentType: 'image/png'
            }));
        });
    });

    describe('generatePresignedDownloadUrl', () => {
        it('should return download URL', async () => {
            const result = await service.generatePresignedDownloadUrl('key');
            expect(result).toBe('https://s3.example.com/url');
            expect(mockS3.getSignedUrl).toHaveBeenCalledWith(expect.objectContaining({
                operation: 'get'
            }));
        });
    });

    describe('deleteFile', () => {
        it('should call S3 delete', async () => {
            await service.deleteFile('key');
            expect(mockS3.delete).toHaveBeenCalled();
        });
    });

    describe('getFileSize', () => {
        it('should return 0 (as implemented)', async () => {
            const result = await service.getFileSize('key');
            expect(result).toBe(0);
        });
    });
});
