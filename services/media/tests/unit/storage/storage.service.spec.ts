import { StorageService } from '../../../src/storage/storage.service';

describe('StorageService', () => {
    let service: StorageService;
    let mockS3: any;

    beforeEach(() => {
        mockS3 = {
            getPresignedPutUrl: jest.fn().mockResolvedValue('https://s3.example.com/upload'),
            getPresignedGetUrl: jest.fn().mockResolvedValue('https://s3.example.com/download'),
            createMultipartUpload: jest.fn().mockResolvedValue({ uploadId: 'upload-1' }),
            uploadPart: jest.fn().mockResolvedValue({ ETag: 'etag-1' }),
            completeMultipartUpload: jest.fn().mockResolvedValue({}),
            deleteFile: jest.fn().mockResolvedValue(undefined),
            getFileMetadata: jest.fn().mockResolvedValue({ ContentLength: 2048 }),
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
            expect(result).toBe('https://s3.example.com/upload');
            expect(mockS3.getPresignedPutUrl).toHaveBeenCalled();
        });
    });

    describe('generatePresignedDownloadUrl', () => {
        it('should return download URL', async () => {
            const result = await service.generatePresignedDownloadUrl('key');
            expect(result).toBe('https://s3.example.com/download');
        });
    });

    describe('deleteFile', () => {
        it('should call S3 deleteFile', async () => {
            await service.deleteFile('key');
            expect(mockS3.deleteFile).toHaveBeenCalled();
        });
    });

    describe('getFileSize', () => {
        it('should return content length', async () => {
            const result = await service.getFileSize('key');
            expect(result).toBe(2048);
        });

        it('should return 0 for missing metadata', async () => {
            mockS3.getFileMetadata.mockResolvedValue(null);
            const result = await service.getFileSize('key');
            expect(result).toBe(0);
        });
    });
});
