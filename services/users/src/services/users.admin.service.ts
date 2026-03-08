import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException } from '@nestlancer/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersAdminService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly config: ConfigService,
    ) { }

    async listUsers(page: number, limit: number, status?: string) {
        const where = status ? { status: status as any } : {};

        const [users, total] = await Promise.all([
            this.prismaRead.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { authConfig: true }
            }),
            this.prismaRead.user.count({ where })
        ]);

        return {
            data: users.map(u => ({
                id: u.id,
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
                role: u.role,
                status: u.status,
                emailVerified: u.emailVerified,
                twoFactorEnabled: u.twoFactorEnabled || u.authConfig?.twoFactorEnabled || false,
                createdAt: u.createdAt,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    async searchUsers(query: string, page: number, limit: number) {
        const where = {
            OR: [
                { email: { contains: query, mode: 'insensitive' as any } },
                { firstName: { contains: query, mode: 'insensitive' as any } },
                { lastName: { contains: query, mode: 'insensitive' as any } },
            ],
        };

        const [users, total] = await Promise.all([
            this.prismaRead.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prismaRead.user.count({ where }),
        ]);

        return {
            data: users.map(u => ({
                id: u.id,
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
                role: u.role,
                status: u.status,
                createdAt: u.createdAt,
            })),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    async getUserDetails(userId: string) {
        const user = await this.prismaRead.user.findUnique({
            where: { id: userId },
            include: { preferences: true, authConfig: true }
        });

        if (!user) {
            throw new BusinessLogicException('User not found', 'USER_001');
        }

        return user;
    }

    async updateUser(userId: string, dto: any) {
        const user = await this.prismaWrite.user.update({
            where: { id: userId },
            data: dto,
        });
        return user;
    }

    async changeRole(userId: string, role: string) {
        const user = await this.prismaWrite.user.update({
            where: { id: userId },
            data: { role: role as any },
        });

        await this.prismaWrite.outbox.create({
            data: {
                type: 'ADMIN_USER_ROLE_CHANGED',
                payload: { userId, role },
            },
        });

        return user;
    }

    async changeUserStatus(userId: string, status: string) {
        const user = await this.prismaWrite.user.update({
            where: { id: userId },
            data: { status: status as any }
        });

        if (status === 'SUSPENDED') {
            await this.prismaWrite.session.updateMany({
                where: { userId },
                data: { expiresAt: new Date() }
            });
        }

        await this.prismaWrite.outbox.create({
            data: {
                type: 'ADMIN_USER_STATUS_CHANGED',
                payload: { userId, status }
            }
        });

        return user;
    }

    async forcePasswordReset(userId: string) {
        // TODO: Set flag requiring password change on next login
        await this.prismaWrite.outbox.create({
            data: {
                type: 'ADMIN_FORCE_PASSWORD_RESET',
                payload: { userId },
            },
        });

        return { userId, passwordResetRequired: true };
    }

    async adminResetPassword(userId: string, newPassword?: string) {
        const pWord = newPassword || `Tmp_${Math.random().toString(36).slice(2)}!`;
        const saltRounds = this.config.get<number>('authService.security.bcryptSaltRounds') || 12;
        const passwordHash = await bcrypt.hash(pWord, saltRounds);

        await this.prismaWrite.$transaction(async (tx: any) => {
            await tx.user.update({
                where: { id: userId },
                data: { passwordHash }
            });

            await tx.session.updateMany({
                where: { userId },
                data: { expiresAt: new Date() }
            });

            await tx.outbox.create({
                data: {
                    type: 'ADMIN_USER_PASSWORD_RESET',
                    payload: { userId, temporaryPassword: pWord }
                }
            });
        });

        return {
            passwordReset: true,
            hasTemporaryPassword: true,
            temporaryPasswordReturnOnlyIfRequested: pWord
        };
    }

    async getUserSessions(userId: string) {
        const sessions = await this.prismaRead.session.findMany({
            where: { userId, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
        });

        return { data: sessions };
    }

    async terminateUserSession(sessionId: string) {
        await this.prismaWrite.session.update({
            where: { id: sessionId },
            data: { expiresAt: new Date() },
        });

        return { terminated: true };
    }

    async terminateAllUserSessions(userId: string) {
        const result = await this.prismaWrite.session.updateMany({
            where: { userId },
            data: { expiresAt: new Date() },
        });

        return { terminated: result.count };
    }

    async getUserActivity(userId: string, page: number, limit: number) {
        // TODO: Query audit logs for user activity
        return {
            data: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
        };
    }

    async deleteUser(userId: string) {
        await this.prismaWrite.user.update({
            where: { id: userId },
            data: { status: 'DELETED' as any },
        });

        await this.prismaWrite.session.updateMany({
            where: { userId },
            data: { expiresAt: new Date() },
        });

        await this.prismaWrite.outbox.create({
            data: {
                type: 'ADMIN_USER_DELETED',
                payload: { userId },
            },
        });

        return { deleted: true };
    }

    async restoreUser(userId: string) {
        await this.prismaWrite.user.update({
            where: { id: userId },
            data: { status: 'ACTIVE' as any },
        });

        await this.prismaWrite.outbox.create({
            data: {
                type: 'ADMIN_USER_RESTORED',
                payload: { userId },
            },
        });

        return { restored: true };
    }

    async bulkOperation(dto: any) {
        const results = { success: 0, failed: 0, errors: [] as any[] };

        for (const userId of dto.userIds) {
            try {
                switch (dto.action) {
                    case 'suspend':
                        await this.changeUserStatus(userId, 'SUSPENDED');
                        break;
                    case 'activate':
                        await this.changeUserStatus(userId, 'ACTIVE');
                        break;
                    case 'delete':
                        await this.deleteUser(userId);
                        break;
                    case 'resetPassword':
                        await this.adminResetPassword(userId);
                        break;
                    default:
                        throw new Error(`Unknown action: ${dto.action}`);
                }
                results.success++;
            } catch (err: any) {
                results.failed++;
                results.errors.push({ userId, error: err.message });
            }
        }

        return results;
    }

    async getLogs(page: number, limit: number) {
        // TODO: Query admin audit logs
        return {
            data: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
        };
    }

    async getSecurityStats() {
        // TODO: Aggregate security-related statistics
        return {
            totalUsers: 0,
            activeUsers: 0,
            suspendedUsers: 0,
            twoFactorEnabled: 0,
            failedLogins24h: 0,
            activeSessions: 0,
        };
    }
}
