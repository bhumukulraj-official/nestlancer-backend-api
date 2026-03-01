import { ShareService } from '../../../src/share/share.service';

describe('ShareService', () => {
    let service: ShareService;
    let mockPrismaWrite: any;
    let mockPrismaRead: any;
    let mockHashingService: any;
    let mockConfigService: any;

    beforeEach(() => {
        mockPrismaRead = {
            media: { findFirst: jest.fn().mockResolvedValue({ id: 'm-1', uploaderId: 'user-1' }) },
            mediaShareLink: {
                findUnique: jest.fn().mockResolvedValue({ token: 'abc123', expiresAt: null, passwordHash: null, media: { id: 'm-1', uploaderId: 'user-1' } }),
            },
        };
        mockPrismaWrite = {
            mediaShareLink: {
                create: jest.fn().mockResolvedValue({ token: 'abc123', expiresAt: null, passwordHash: null }),
                delete: jest.fn().mockResolvedValue({}),
            },
        };
        mockHashingService = {
            hash: jest.fn().mockResolvedValue('hashed_pw'),
            compare: jest.fn().mockResolvedValue(true),
        };
        mockConfigService = { get: jest.fn().mockReturnValue('https://nestlancer.com') };
        service = new ShareService(mockPrismaWrite, mockPrismaRead, mockHashingService, mockConfigService);
    });

    describe('createShareLink', () => {
        it('should create share link', async () => {
            const result = await service.createShareLink('user-1', 'm-1', {} as any);
            expect(result.shareUrl).toContain('/share/');
        });

        it('should throw for non-existent media', async () => {
            mockPrismaRead.media.findFirst.mockResolvedValue(null);
            await expect(service.createShareLink('user-1', 'invalid', {} as any)).rejects.toThrow();
        });
    });

    describe('validateShareLink', () => {
        it('should validate a valid link', async () => {
            const result = await service.validateShareLink('abc123');
            expect(result.id).toBe('m-1');
        });

        it('should reject expired link', async () => {
            mockPrismaRead.mediaShareLink.findUnique.mockResolvedValue({
                token: 'abc123', expiresAt: new Date('2020-01-01'), passwordHash: null, media: { id: 'm-1' }
            });
            await expect(service.validateShareLink('abc123')).rejects.toThrow();
        });

        it('should reject invalid password', async () => {
            mockPrismaRead.mediaShareLink.findUnique.mockResolvedValue({
                token: 'abc123', expiresAt: null, passwordHash: 'hashed', media: { id: 'm-1' }
            });
            mockHashingService.compare.mockResolvedValue(false);
            await expect(service.validateShareLink('abc123', 'wrong')).rejects.toThrow();
        });
    });

    describe('revokeShareLink', () => {
        it('should revoke share link', async () => {
            const result = await service.revokeShareLink('user-1', 'abc123');
            expect(result.revoked).toBe(true);
        });

        it('should reject if not owner', async () => {
            mockPrismaRead.mediaShareLink.findUnique.mockResolvedValue({
                token: 'abc123', media: { uploaderId: 'other-user' }
            });
            await expect(service.revokeShareLink('user-1', 'abc123')).rejects.toThrow();
        });
    });
});
