import { Injectable } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database/prisma/prisma-write.service';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { BusinessLogicException } from '@nestlancer/common/exceptions/business-logic.exception';
import { QueuePublisherService } from '@nestlancer/queue/queue-publisher.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailVerificationService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly queue: QueuePublisherService,
        private readonly config: ConfigService,
    ) { }

    async verifyEmail(token: string) {
        const verificationToken = await this.prismaRead.verificationToken.findFirst({
            where: {
                token,
                type: 'EMAIL_VERIFICATION',
                expiresAt: { gt: new Date() }
            },
            include: { user: true }
        });

        if (!verificationToken) {
            throw new BusinessLogicException('Invalid or expired verification token', 'AUTH_004', {
                reason: 'tokenExpired',
                canRequestNew: true
            });
        }

        await this.prismaWrite.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: verificationToken.userId },
                data: { emailVerified: true },
            });

            await tx.verificationToken.delete({
                where: { id: verificationToken.id }
            });

            await tx.outbox.create({
                data: {
                    eventType: 'USER_EMAIL_VERIFIED',
                    payload: {
                        userId: verificationToken.userId,
                        email: verificationToken.user.email,
                    }
                }
            });
        });

        return {
            emailVerified: true,
            verifiedAt: new Date()
        };
    }

    async resendVerification(email: string) {
        const user = await this.prismaRead.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) return true; // Pretend it worked for security

        if (user.emailVerified) {
            return true; // Already verified
        }

        // Delete existing unused email tokens
        await this.prismaWrite.verificationToken.deleteMany({
            where: {
                userId: user.id,
                type: 'EMAIL_VERIFICATION'
            }
        });

        const emailVerificationToken = `verify_${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;
        const verificationExpiresAt = new Date(Date.now() + (this.config.get<number>('authService.tokens.emailVerificationExpiresIn') || 86400) * 1000);

        await this.prismaWrite.$transaction(async (tx) => {
            await tx.verificationToken.create({
                data: {
                    userId: user.id,
                    token: emailVerificationToken,
                    type: 'EMAIL_VERIFICATION',
                    expiresAt: verificationExpiresAt,
                }
            });

            await tx.outbox.create({
                data: {
                    eventType: 'EMAIL_VERIFICATION_RESENT',
                    payload: {
                        userId: user.id,
                        email: user.email,
                        token: emailVerificationToken,
                    }
                }
            });
        });

        return true;
    }
}
