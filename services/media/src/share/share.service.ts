import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { HashingService } from '@nestlancer/crypto';
import { ShareMediaDto } from '../dto/share-media.dto';
import { ResourceNotFoundException } from '@nestlancer/common/exceptions/not-found.exception';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class ShareService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly hashingService: HashingService,
        private readonly configService: ConfigService,
    ) { }

    async createShareLink(userId: string, mediaId: string, dto: ShareMediaDto) {
        const media = await this.prismaRead.media.findFirst({
            where: { id: mediaId, uploaderId: userId },
        });

        if (!media) {
            throw new ResourceNotFoundException('Media', mediaId);
        }

        const token = crypto.randomBytes(32).toString('hex');
        let expiresAt: Date | null = null;

        if (dto.expiresInSeconds) {
            expiresAt = new Date(Date.now() + dto.expiresInSeconds * 1000);
        }

        const passwordHash = dto.password
            ? await this.hashingService.hash(dto.password)
            : null;

        const shareLink = await this.prismaWrite.mediaShareLink.create({
            data: {
                mediaId,
                token,
                expiresAt,
                passwordHash,
                allowedEmails: dto.allowedEmails || [],
            },
        });

        const baseUrl = this.configService.get<string>('APP_URL', 'https://nestlancer.com');

        return {
            shareUrl: `${baseUrl}/share/${token}`,
            expiresAt: shareLink.expiresAt,
            passwordProtected: !!shareLink.passwordHash,
        };
    }

    async validateShareLink(token: string, password?: string) {
        const shareLink = await this.prismaRead.mediaShareLink.findUnique({
            where: { token },
            include: { media: true },
        });

        if (!shareLink) {
            throw new ResourceNotFoundException('ShareLink', token);
        }

        // Check expiration
        if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
            throw new ForbiddenException('Share link has expired');
        }

        // Check password if required
        if (shareLink.passwordHash) {
            if (!password) {
                throw new ForbiddenException('Password required');
            }

            const isValid = await this.hashingService.compare(password, shareLink.passwordHash);
            if (!isValid) {
                throw new ForbiddenException('Invalid password');
            }
        }

        return shareLink.media;
    }

    async revokeShareLink(userId: string, token: string) {
        const shareLink = await this.prismaRead.mediaShareLink.findUnique({
            where: { token },
            include: { media: { select: { uploaderId: true } } },
        });

        if (!shareLink) {
            throw new ResourceNotFoundException('ShareLink', token);
        }

        if (shareLink.media.uploaderId !== userId) {
            throw new ForbiddenException('You do not own this share link');
        }

        await this.prismaWrite.mediaShareLink.delete({
            where: { token },
        });

        return { revoked: true };
    }
}
