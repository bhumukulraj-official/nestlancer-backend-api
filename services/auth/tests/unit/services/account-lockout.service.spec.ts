import { AccountLockoutService } from '../../../src/services/account-lockout.service';

describe('AccountLockoutService', () => {
    let service: AccountLockoutService;
    let mockPrismaRead: any;
    let mockPrismaWrite: any;
    let mockConfig: any;

    beforeEach(() => {
        mockPrismaRead = {
            userAuthConfig: {
                findUnique: jest.fn().mockResolvedValue({
                    failedLoginAttempts: 0,
                    lockedUntil: null,
                }),
            },
        };
        mockPrismaWrite = {
            userAuthConfig: {
                upsert: jest.fn().mockResolvedValue({}),
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
        };
        mockConfig = {
            get: jest.fn().mockImplementation((key: string) => {
                const config: Record<string, any> = {
                    'authService.security.maxFailedAttempts': 5,
                    'authService.security.lockoutDurationMs': 1800000,
                };
                return config[key];
            }),
        };

        service = new AccountLockoutService(mockPrismaRead, mockPrismaWrite, mockConfig);
    });

    describe('checkLockout', () => {
        it('should pass when user is not locked', async () => {
            await expect(service.checkLockout('user-1')).resolves.toBeUndefined();
        });

        it('should throw when user is locked', async () => {
            mockPrismaRead.userAuthConfig.findUnique.mockResolvedValue({
                lockedUntil: new Date(Date.now() + 60000),
            });

            await expect(service.checkLockout('user-1'))
                .rejects.toThrow();
        });

        it('should pass when lockout has expired', async () => {
            mockPrismaRead.userAuthConfig.findUnique.mockResolvedValue({
                lockedUntil: new Date(Date.now() - 60000), // expired
            });

            await expect(service.checkLockout('user-1')).resolves.toBeUndefined();
        });

        it('should pass when no auth config exists', async () => {
            mockPrismaRead.userAuthConfig.findUnique.mockResolvedValue(null);

            await expect(service.checkLockout('user-1')).resolves.toBeUndefined();
        });
    });

    describe('handleFailedAttempt', () => {
        it('should increment failed attempts and return remaining', async () => {
            const result = await service.handleFailedAttempt('user-1', { failedLoginAttempts: 2 });
            expect(result).toBe(2); // 5 max - 3 current = 2 remaining
            expect(mockPrismaWrite.userAuthConfig.upsert).toHaveBeenCalled();
        });

        it('should lock account after max attempts', async () => {
            await expect(service.handleFailedAttempt('user-1', { failedLoginAttempts: 4 }))
                .rejects.toThrow();
        });

        it('should return 0 if already locked', async () => {
            const result = await service.handleFailedAttempt('user-1', {
                failedLoginAttempts: 5,
                lockedUntil: new Date(Date.now() + 60000),
            });
            expect(result).toBe(0);
        });

        it('should handle null authConfig', async () => {
            const result = await service.handleFailedAttempt('user-1', null);
            expect(result).toBe(4); // 5 max - 1 attempt = 4 remaining
        });

        it('should use default maxAttempts of 5', async () => {
            mockConfig.get.mockReturnValue(undefined);
            const result = await service.handleFailedAttempt('user-1', { failedLoginAttempts: 0 });
            expect(result).toBe(4);
        });
    });

    describe('resetFailedAttempts', () => {
        it('should reset failed attempts', async () => {
            await service.resetFailedAttempts('user-1');
            expect(mockPrismaWrite.userAuthConfig.updateMany).toHaveBeenCalledWith({
                where: { userId: 'user-1', failedLoginAttempts: { gt: 0 } },
                data: {
                    failedLoginAttempts: 0,
                    lastFailedLoginAttempt: null,
                    lockedUntil: null,
                },
            });
        });
    });
});
