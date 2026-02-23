import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { ShareMediaDto } from '../dto/share-media.dto';
import { ResourceNotFoundException } from '@nestlancer/common/exceptions/not-found.exception';
import * as crypto from 'crypto';

@Injectable()
export class ShareService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async createShareLink(userId: string, mediaId: string, dto: ShareMediaDto) {
        const media = await this.prismaRead.media.findFirst({
            where: { id: mediaId, userId },
        });

        if (!media) {
            throw new ResourceNotFoundException('Media', mediaId);
        }

        const token = crypto.randomBytes(32).toString('hex');
        let expiresAt = null;

        if (dto.expiresInSeconds) {
            expiresAt = new Date(Date.now() + dto.expiresInSeconds * 1000);
        }

        const shareLink = await this.prismaWrite.mediaShareLink.create({
            data: {
                mediaId,
                token,
                expiresAt,
                passwordHash: dto.password ? await this.hashPassword(dto.password) : null,
                allowedEmails: dto.allowedEmails || [],
            },
        });

        return {
            shareUrl: `https://nestlancer.com/share/${token}`, // Assume frontend URL
            expiresAt: shareLink.expiresAt,
            passwordProtected: !!shareLink.passwordHash,
        };
    }

    private async hashPassword(password: string): Promise<string> {
        // Basic stub, practically use bcrypt or argon2
        return crypto.createHash('sha256').update(password).digest('hex');
    }
}
