import { SessionsService } from '../../../src/services/sessions.service';

describe('SessionsService', () => {
    let service: SessionsService;
    let mockPrismaWrite: any;
    let mockPrismaRead: any;

    const mockSessions = [
        {
            id: 'session-1',
            userId: 'user-1',
            refreshTokenJti: 'current-jti',
            userAgent: 'Mozilla/5.0 Chrome/120',
            ipAddress: '127.0.0.1',
            createdAt: new Date(),
            lastActivityAt: new Date(),
            expiresAt: new Date(Date.now() + 86400000),
        },
        {
            id: 'session-2',
            userId: 'user-1',
            refreshTokenJti: 'other-jti',
            userAgent: 'Mozilla/5.0 Firefox/120',
            ipAddress: '192.168.1.1',
            createdAt: new Date(),
            lastActivityAt: new Date(),
            expiresAt: new Date(Date.now() + 86400000),
        },
    ];

    beforeEach(() => {
        mockPrismaRead = {
            userSession: {
                findMany: jest.fn().mockResolvedValue(mockSessions),
                findUnique: jest.fn().mockResolvedValue(mockSessions[1]),
            },
        };
        mockPrismaWrite = {
            userSession: {
                update: jest.fn().mockResolvedValue({}),
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
        };

        service = new SessionsService(mockPrismaWrite, mockPrismaRead);
    });

    describe('getSessions', () => {
        it('should return formatted session list', async () => {
            const result = await service.getSessions('user-1', 'current-jti');
            expect(result).toHaveLength(2);
            expect(result[0].current).toBe(true);
            expect(result[1].current).toBe(false);
        });

        it('should include device info parsed from user agent', async () => {
            const result = await service.getSessions('user-1', 'current-jti');
            expect(result[0].device).toBeDefined();
            expect(result[0].device.browser).toBeDefined();
        });

        it('should include location info', async () => {
            const result = await service.getSessions('user-1', 'current-jti');
            expect(result[0].location.ip).toBe('127.0.0.1');
        });
    });

    describe('terminateSession', () => {
        it('should terminate another session', async () => {
            const result = await service.terminateSession('user-1', 'session-2', 'current-jti');
            expect(result.sessionId).toBe('session-2');
            expect(result.terminatedAt).toBeDefined();
            expect(mockPrismaWrite.userSession.update).toHaveBeenCalledWith({
                where: { id: 'session-2' },
                data: { isRevoked: true },
            });
        });

        it('should throw when trying to terminate current session', async () => {
            mockPrismaRead.userSession.findUnique.mockResolvedValue(mockSessions[0]);

            await expect(service.terminateSession('user-1', 'session-1', 'current-jti'))
                .rejects.toThrow();
        });

        it('should throw for non-existent session', async () => {
            mockPrismaRead.userSession.findUnique.mockResolvedValue(null);

            await expect(service.terminateSession('user-1', 'invalid', 'current-jti'))
                .rejects.toThrow();
        });

        it('should throw for session belonging to another user', async () => {
            mockPrismaRead.userSession.findUnique.mockResolvedValue({ ...mockSessions[1], userId: 'other-user' });

            await expect(service.terminateSession('user-1', 'session-2', 'current-jti'))
                .rejects.toThrow();
        });
    });

    describe('terminateOtherSessions', () => {
        it('should revoke all sessions except current', async () => {
            const result = await service.terminateOtherSessions('user-1', 'current-jti');
            expect(result).toBe(true);
            expect(mockPrismaWrite.userSession.updateMany).toHaveBeenCalledWith({
                where: {
                    userId: 'user-1',
                    refreshTokenJti: { not: 'current-jti' },
                    isRevoked: false,
                },
                data: { isRevoked: true },
            });
        });
    });
});
