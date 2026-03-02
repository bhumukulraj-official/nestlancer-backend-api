import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException, ProjectStatus, PaymentStatus } from '@nestlancer/common';
import { UpdateProfileDto } from '../dto/update-profile.dto';

interface UserStats {
    projectsCompleted: number;
    totalSpent: number;
    projectsInProgress: number;
    totalProjects: number;
}

interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: string;
    twoFactorEnabled: boolean;
    timezone?: string;
    language?: string;
    preferences: {
        notifications: Record<string, unknown>;
        privacy: Record<string, unknown>;
    };
    stats: UserStats;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
}

@Injectable()
export class ProfileService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async getProfile(userId: string): Promise<UserProfile> {
        const user = await this.prismaRead.user.findUnique({
            where: { id: userId },
            include: {
                preferences: true,
            }
        });

        if (!user) {
            throw new BusinessLogicException('User not found', 'USER_001');
        }

        const stats = await this.getUserStats(userId);
        return this.formatProfileResponse(user, stats);
    }

    async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfile> {
        const user = await this.prismaWrite.user.update({
            where: { id: userId },
            data: {
                name: dto.name,
                preferences: dto.timezone || dto.language ? {
                    upsert: {
                        create: {
                            timezone: dto.timezone || 'UTC',
                            language: dto.language || 'en',
                        },
                        update: {
                            ...(dto.timezone && { timezone: dto.timezone }),
                            ...(dto.language && { language: dto.language }),
                        }
                    }
                } : undefined
            },
            include: {
                preferences: true,
            }
        });

        await this.prismaWrite.outboxEvent.create({
            data: {
                type: 'USER_PROFILE_UPDATED',
                aggregateType: 'User',
                aggregateId: user.id,
                payload: { userId: user.id, updatedFields: Object.keys(dto) }
            }
        });

        const stats = await this.getUserStats(userId);
        return this.formatProfileResponse(user, stats);
    }

    private async getUserStats(userId: string): Promise<UserStats> {
        const [projectStats, paymentStats] = await Promise.all([
            this.prismaRead.project.groupBy({
                by: ['status'],
                where: { clientId: userId, deletedAt: null },
                _count: { id: true }
            }),
            this.prismaRead.payment.aggregate({
                where: {
                    clientId: userId,
                    status: PaymentStatus.COMPLETED
                },
                _sum: { amount: true }
            })
        ]);

        const statusCounts = projectStats.reduce((acc, item) => {
            acc[item.status] = item._count.id;
            return acc;
        }, {} as Record<string, number>);

        const totalProjects = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
        const projectsCompleted = statusCounts[ProjectStatus.COMPLETED] || 0;
        const projectsInProgress = statusCounts[ProjectStatus.IN_PROGRESS] || 0;

        return {
            projectsCompleted,
            totalSpent: paymentStats._sum.amount || 0,
            projectsInProgress,
            totalProjects,
        };
    }

    private formatProfileResponse(user: any, stats: UserStats): UserProfile {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled || false,
            timezone: user.preferences?.timezone,
            language: user.preferences?.language,
            preferences: {
                notifications: user.preferences?.notificationSettings || {},
                privacy: user.preferences?.privacySettings || {}
            },
            stats,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastLoginAt: user.lastLoginAt,
        };
    }
}
