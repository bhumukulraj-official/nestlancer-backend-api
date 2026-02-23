import { Injectable } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database/prisma/prisma-write.service';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { BusinessLogicException } from '@nestlancer/common/exceptions/business-logic.exception';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class ProfileService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async getProfile(userId: string) {
        const user = await this.prismaRead.user.findUnique({
            where: { id: userId },
            include: {
                preferences: true,
                authConfig: true,
            }
        });

        if (!user) {
            throw new BusinessLogicException('User not found', 'USER_001');
        }

        return this.formatProfileResponse(user);
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const user = await this.prismaWrite.user.update({
            where: { id: userId },
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                preferences: {
                    update: {
                        timezone: dto.timezone,
                        language: dto.language,
                    }
                } // Country omitted for simplicity, but easily addable
            },
            include: {
                preferences: true,
                authConfig: true,
            }
        });

        await this.prismaWrite.outbox.create({
            data: {
                eventType: 'USER_PROFILE_UPDATED',
                payload: { userId: user.id }
            }
        });

        return this.formatProfileResponse(user);
    }

    private formatProfileResponse(user: any) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            avatar: user.avatar,
            role: user.role,
            emailVerified: user.emailVerified,
            twoFactorEnabled: user.authConfig?.twoFactorEnabled || false,
            timezone: user.preferences?.timezone,
            language: user.preferences?.language,
            country: user.preferences?.country || 'US',
            preferences: {
                notifications: user.preferences?.emailNotifications || {},
                privacy: user.preferences?.privacySettings || {}
            },
            stats: {
                projectsCompleted: 0, // Placeholder
                totalSpent: 0, // Placeholder
            },
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastLoginAt: user.authConfig?.lastFailedLoginAttempt // Map properly later
        };
    }
}
