jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed_temp_password'),
}));

import { UsersAdminService } from '../../../src/services/users.admin.service';

describe('UsersAdminService', () => {
    let service: UsersAdminService;
    let mockPrismaWrite: any;
    let mockPrismaRead: any;
    let mockConfig: any;

    const mockUsers = [
        { id: 'user-1', email: 'test@example.com', firstName: 'John', lastName: 'Doe', role: 'USER', status: 'ACTIVE', emailVerified: true, createdAt: new Date(), authConfig: { twoFactorEnabled: false } },
        { id: 'user-2', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: 'ADMIN', status: 'ACTIVE', emailVerified: true, createdAt: new Date(), authConfig: { twoFactorEnabled: true } },
    ];

    beforeEach(() => {
        mockPrismaRead = {
            user: {
                findMany: jest.fn().mockResolvedValue(mockUsers),
                count: jest.fn().mockResolvedValue(2),
                findUnique: jest.fn().mockResolvedValue(mockUsers[0]),
            },
        };
        mockPrismaWrite = {
            user: {
                update: jest.fn().mockResolvedValue(mockUsers[0]),
            },
            userSession: {
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            outbox: {
                create: jest.fn().mockResolvedValue({}),
            },
            $transaction: jest.fn().mockImplementation(async (fn) => {
                const tx = {
                    user: { update: jest.fn().mockResolvedValue({}) },
                    userSession: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
                    outbox: { create: jest.fn().mockResolvedValue({}) },
                };
                return fn(tx);
            }),
        };
        mockConfig = {
            get: jest.fn().mockReturnValue(12),
        };

        service = new UsersAdminService(mockPrismaWrite, mockPrismaRead, mockConfig);
    });

    describe('listUsers', () => {
        it('should return paginated users list', async () => {
            const result = await service.listUsers(1, 10);
            expect(result.data).toHaveLength(2);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.total).toBe(2);
        });

        it('should filter by status', async () => {
            await service.listUsers(1, 10, 'ACTIVE');
            expect(mockPrismaRead.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: 'ACTIVE' },
                })
            );
        });

        it('should return empty where when no status filter', async () => {
            await service.listUsers(1, 10);
            expect(mockPrismaRead.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {},
                })
            );
        });
    });

    describe('getUserDetails', () => {
        it('should return user details with preferences', async () => {
            const result = await service.getUserDetails('user-1');
            expect(result).toBeDefined();
            expect(result.id).toBe('user-1');
        });

        it('should throw for non-existent user', async () => {
            mockPrismaRead.user.findUnique.mockResolvedValue(null);

            await expect(service.getUserDetails('invalid-id'))
                .rejects.toThrow();
        });
    });

    describe('changeUserStatus', () => {
        it('should update user status', async () => {
            const result = await service.changeUserStatus('user-1', 'SUSPENDED');
            expect(mockPrismaWrite.user.update).toHaveBeenCalledWith({
                where: { id: 'user-1' },
                data: { status: 'SUSPENDED' },
            });
        });

        it('should revoke all sessions when suspending', async () => {
            await service.changeUserStatus('user-1', 'SUSPENDED');
            expect(mockPrismaWrite.userSession.updateMany).toHaveBeenCalledWith({
                where: { userId: 'user-1' },
                data: { isRevoked: true },
            });
        });

        it('should create outbox event', async () => {
            await service.changeUserStatus('user-1', 'ACTIVE');
            expect(mockPrismaWrite.outbox.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        eventType: 'ADMIN_USER_STATUS_CHANGED',
                    }),
                })
            );
        });
    });

    describe('adminResetPassword', () => {
        it('should reset password with provided password', async () => {
            const result = await service.adminResetPassword('user-1', 'NewPassword123!');
            expect(result.passwordReset).toBe(true);
            expect(result.hasTemporaryPassword).toBe(true);
        });

        it('should generate temporary password when none provided', async () => {
            const result = await service.adminResetPassword('user-1');
            expect(result.passwordReset).toBe(true);
            expect(result.temporaryPasswordReturnOnlyIfRequested).toBeDefined();
        });

        it('should revoke all sessions on password reset', async () => {
            await service.adminResetPassword('user-1', 'NewPassword123!');
            expect(mockPrismaWrite.$transaction).toHaveBeenCalled();
        });
    });
});
