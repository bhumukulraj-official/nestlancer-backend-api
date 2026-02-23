import { Injectable } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database/prisma/prisma-write.service';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { BusinessLogicException } from '@nestlancer/common/exceptions/business-logic.exception';
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
                twoFactorEnabled: u.authConfig?.twoFactorEnabled || false,
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

    async changeUserStatus(userId: string, status: string) {
        const user = await this.prismaWrite.user.update({
            where: { id: userId },
            data: { status: status as any }
        });

        if (status === 'SUSPENDED') {
            await this.prismaWrite.userSession.updateMany({
                where: { userId },
                data: { isRevoked: true }
            });
        }

        await this.prismaWrite.outbox.create({
            data: {
                eventType: 'ADMIN_USER_STATUS_CHANGED',
                payload: { userId, status }
            }
        });

        return user;
    }

    async adminResetPassword(userId: string, newPassword?: string) {
        const pWord = newPassword || `Tmp_${Math.random().toString(36).slice(2)}!`;
        const saltRounds = this.config.get<number>('authService.security.bcryptSaltRounds') || 12;
        const passwordHash = await bcrypt.hash(pWord, saltRounds);

        await this.prismaWrite.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: { passwordHash }
            });

            await tx.userSession.updateMany({
                where: { userId },
                data: { isRevoked: true }
            });

            // Emit event so an email with the temp password can be sent
            await tx.outbox.create({
                data: {
                    eventType: 'ADMIN_USER_PASSWORD_RESET',
                    payload: { userId, temporaryPassword: pWord }
                }
            });
        });

        return {
            passwordReset: true,
            hasTemporaryPassword: true, // Only return the actual password to admin if requested, but better UX is email it.
            temporaryPasswordReturnOnlyIfRequested: pWord
        };
    }
}
