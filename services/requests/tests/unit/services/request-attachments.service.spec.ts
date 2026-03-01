import { RequestAttachmentsService } from '../../../src/services/request-attachments.service';

describe('RequestAttachmentsService', () => {
    let service: RequestAttachmentsService;
    let mockPrismaWrite: any;
    let mockPrismaRead: any;
    let mockStorageService: any;
    let mockConfig: any;

    const mockRequest = {
        id: 'req-1',
        userId: 'user-1',
        status: 'DRAFT',
        attachments: [
            { id: 'att-1', filename: 'doc.pdf', fileUrl: 'https://cdn.example.com/doc.pdf', mimeType: 'application/pdf', size: 1024, createdAt: new Date() },
        ],
        _count: { attachments: 1 },
    };

    beforeEach(() => {
        mockPrismaRead = {
            projectRequest: { findFirst: jest.fn().mockResolvedValue(mockRequest) },
            requestAttachment: { findFirst: jest.fn().mockResolvedValue(mockRequest.attachments[0]) },
        };
        mockPrismaWrite = {
            requestAttachment: {
                create: jest.fn().mockResolvedValue({ id: 'att-2', filename: 'new.pdf', fileUrl: 'https://cdn.example.com/new.pdf', mimeType: 'application/pdf', size: 2048 }),
                delete: jest.fn().mockResolvedValue({}),
            },
        };
        mockStorageService = {
            uploadFile: jest.fn().mockResolvedValue('https://cdn.example.com/new.pdf'),
        };
        mockConfig = {
            get: jest.fn().mockImplementation((key: string) => {
                const config: Record<string, any> = {
                    'requestsService.attachments.maxCount': 10,
                    'requestsService.attachments.allowedMimeTypes': ['application/pdf', 'image/jpeg'],
                    'requestsService.attachments.maxSize': 10485760,
                    'requestsService.attachments.s3Bucket': 'nestlancer-requests',
                };
                return config[key];
            }),
        };

        service = new RequestAttachmentsService(mockPrismaWrite, mockPrismaRead, mockStorageService, mockConfig);
    });

    describe('getAttachments', () => {
        it('should return formatted attachments list', async () => {
            const result = await service.getAttachments('user-1', 'req-1');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('att-1');
            expect(result[0].filename).toBe('doc.pdf');
        });

        it('should throw for non-existent request', async () => {
            mockPrismaRead.projectRequest.findFirst.mockResolvedValue(null);
            await expect(service.getAttachments('user-1', 'invalid')).rejects.toThrow();
        });
    });

    describe('addAttachment', () => {
        const mockFile = { mimetype: 'application/pdf', size: 2048, buffer: Buffer.from('data'), originalname: 'new.pdf' } as Express.Multer.File;

        it('should add attachment successfully', async () => {
            const result = await service.addAttachment('user-1', 'req-1', mockFile);
            expect(result.id).toBe('att-2');
            expect(mockStorageService.uploadFile).toHaveBeenCalled();
        });

        it('should reject when request is not in DRAFT status', async () => {
            mockPrismaRead.projectRequest.findFirst.mockResolvedValue({ ...mockRequest, status: 'SUBMITTED' });
            await expect(service.addAttachment('user-1', 'req-1', mockFile)).rejects.toThrow();
        });

        it('should reject when max attachments reached', async () => {
            mockPrismaRead.projectRequest.findFirst.mockResolvedValue({ ...mockRequest, _count: { attachments: 10 } });
            await expect(service.addAttachment('user-1', 'req-1', mockFile)).rejects.toThrow();
        });

        it('should reject unsupported file type', async () => {
            const badFile = { ...mockFile, mimetype: 'application/exe' } as Express.Multer.File;
            await expect(service.addAttachment('user-1', 'req-1', badFile)).rejects.toThrow();
        });

        it('should reject file too large', async () => {
            const largeFile = { ...mockFile, size: 20000000 } as Express.Multer.File;
            await expect(service.addAttachment('user-1', 'req-1', largeFile)).rejects.toThrow();
        });
    });

    describe('removeAttachment', () => {
        it('should remove attachment successfully', async () => {
            const result = await service.removeAttachment('user-1', 'req-1', 'att-1');
            expect(result).toBe(true);
            expect(mockPrismaWrite.requestAttachment.delete).toHaveBeenCalledWith({ where: { id: 'att-1' } });
        });

        it('should throw for non-existent attachment', async () => {
            mockPrismaRead.requestAttachment.findFirst.mockResolvedValue(null);
            await expect(service.removeAttachment('user-1', 'req-1', 'invalid')).rejects.toThrow();
        });
    });
});
