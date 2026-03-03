jest.mock('@nestlancer/common', () => ({
    ...jest.requireActual('@nestlancer/common'),
    generateUuid: jest.fn().mockReturnValue('mock-uuid-1234'),
}));

import { TokenService } from '../../../src/services/token.service';

describe('TokenService', () => {
    let service: TokenService;
    let mockJwtService: any;
    let mockConfigService: any;
    let mockPrismaWrite: any;
    let mockPrismaRead: any;

    const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        avatar: 'avatar.jpg',
        emailVerified: true,
        status: 'ACTIVE',
        authConfig: { twoFactorEnabled: false },
    };

    beforeEach(() => {
        mockJwtService = {
            signAsync: jest.fn()
                .mockResolvedValueOnce('mock-access-token')
                .mockResolvedValueOnce('mock-refresh-token'),
            verifyAsync: jest.fn().mockResolvedValue({
                sub: 'user-1',
                type: 'refresh',
                jti: 'mock-uuid-1234',
            }),
        };
        mockConfigService = {
            get: jest.fn().mockImplementation((key: string) => {
                const config: Record<string, any> = {
                    'authService.jwt.accessExpiresIn': 900,
                    'authService.jwt.refreshExpiresIn': 604800,
                    'authService.jwt.accessPrivateKey': 'access-private-key',
                    'authService.jwt.refreshPrivateKey': 'refresh-private-key',
                    'authService.jwt.refreshPublicKey': 'refresh-public-key',
                    'authService.jwt.issuer': 'nestlancer',
                    'authService.jwt.audience': 'nestlancer-api',
                };
                return config[key];
            }),
        };
        mockPrismaWrite = {
            userSession: {
                create: jest.fn().mockResolvedValue({}),
                update: jest.fn().mockResolvedValue({}),
            },
        };
        mockPrismaRead = {
            userSession: {
                findFirst: jest.fn().mockResolvedValue({ id: 'session-1', userId: 'user-1', refreshTokenJti: 'mock-uuid-1234' }),
            },
            user: {
                findUnique: jest.fn().mockResolvedValue(mockUser),
            },
        };

        service = new TokenService(mockJwtService, mockConfigService, mockPrismaWrite, mockPrismaRead);
    });

    describe('generateAuthTokens', () => {
        it('should generate access and refresh tokens', async () => {
            const result = await service.generateAuthTokens(mockUser, false, '127.0.0.1', 'TestAgent');
            expect(result.accessToken).toBe('mock-access-token');
            expect(result.refreshToken).toBe('mock-refresh-token');
            expect(result.expiresIn).toBe(900);
            expect(result.tokenType).toBe('Bearer');
        });

        it('should include user info in response', async () => {
            const result = await service.generateAuthTokens(mockUser);
            expect(result.user.id).toBe('user-1');
            expect(result.user.email).toBe('test@example.com');
            expect(result.user.firstName).toBe('John');
            expect(result.user.role).toBe('USER');
        });

        it('should create a session record', async () => {
            await service.generateAuthTokens(mockUser, false, '127.0.0.1', 'TestAgent');
            expect(mockPrismaWrite.userSession.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        userId: 'user-1',
                        ipAddress: '127.0.0.1',
                        userAgent: 'TestAgent',
                    }),
                })
            );
        });

        it('should use RS256 algorithm', async () => {
            await service.generateAuthTokens(mockUser);
            expect(mockJwtService.signAsync).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ algorithm: 'RS256' })
            );
        });

        it('should use default values for missing ipAddress and userAgent', async () => {
            await service.generateAuthTokens(mockUser);
            expect(mockPrismaWrite.userSession.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        ipAddress: 'unknown',
                        userAgent: 'unknown',
                    }),
                })
            );
        });
    });

    describe('refreshToken', () => {
        beforeEach(() => {
            // Reset signAsync mock for refresh calls
            mockJwtService.signAsync = jest.fn()
                .mockResolvedValueOnce('new-access-token')
                .mockResolvedValueOnce('new-refresh-token');
        });

        it('should refresh tokens successfully', async () => {
            const result = await service.refreshToken('old-refresh-token', '127.0.0.1', 'TestAgent');
            expect(result.accessToken).toBe('new-access-token');
            expect(result.refreshToken).toBe('new-refresh-token');
        });

        it('should revoke old session on refresh', async () => {
            await service.refreshToken('old-refresh-token', '127.0.0.1', 'TestAgent');
            expect(mockPrismaWrite.userSession.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { isRevoked: true },
                })
            );
        });

        it('should throw for invalid token type', async () => {
            mockJwtService.verifyAsync.mockResolvedValue({ sub: 'user-1', type: 'access', jti: 'test' });

            await expect(service.refreshToken('wrong-type-token', '127.0.0.1', 'TestAgent'))
                .rejects.toThrow();
        });

        it('should throw for revoked session', async () => {
            mockPrismaRead.userSession.findFirst.mockResolvedValue(null);

            await expect(service.refreshToken('revoked-token', '127.0.0.1', 'TestAgent'))
                .rejects.toThrow();
        });

        it('should throw for inactive user', async () => {
            mockPrismaRead.user.findUnique.mockResolvedValue({ ...mockUser, status: 'SUSPENDED' });

            await expect(service.refreshToken('token', '127.0.0.1', 'TestAgent'))
                .rejects.toThrow();
        });

        it('should throw for expired refresh token', async () => {
            mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

            await expect(service.refreshToken('expired-token', '127.0.0.1', 'TestAgent'))
                .rejects.toThrow();
        });
    });
});
