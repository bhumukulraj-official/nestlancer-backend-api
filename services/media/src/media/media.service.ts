import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService, ReadOnly } from '@nestlancer/database';
import { StorageService } from '../storage/storage.service';
import { RequestUploadDto } from '../dto/request-upload.dto';
import { ConfirmUploadDto } from '../dto/confirm-upload.dto';
import { DirectUploadDto } from '../dto/direct-upload.dto';
import { UpdateMediaMetadataDto } from '../dto/update-media-metadata.dto';
import { QueryMediaDto } from '../dto/query-media.dto';
import { MediaStatus } from '../interfaces/media.interface';
import { buildPrismaSkipTake, createPaginationMeta, ResourceNotFoundException } from '@nestlancer/common';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class MediaService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly storageService: StorageService,
    ) { }

    @ReadOnly()
    async findByUser(userId: string, query: QueryMediaDto) {
        const { skip, take } = buildPrismaSkipTake(query.page, query.limit);

        const where: any = { userId };
        if (query.fileType) where.fileType = query.fileType;
        if (query.status) where.status = query.status;

        const [items, total] = await Promise.all([
            this.prismaRead.media.findMany({
                where,
                skip,
                take,
                orderBy: { [query.sort || 'createdAt']: (query as any).order || 'desc' },
            }),
            this.prismaRead.media.count({ where }),
        ]);

        return {
            data: items,
            pagination: createPaginationMeta(query.page, query.limit, total),
        };
    }

    async requestUpload(userId: string, dto: RequestUploadDto) {
        const key = this.storageService.generateStorageKey(userId, dto.filename);

        const media = await this.prismaWrite.media.create({
            data: {
                uploaderId: userId,
                filename: dto.filename,
                originalFilename: dto.filename,
                mimeType: dto.mimeType,
                size: dto.size,
                status: MediaStatus.PENDING,
            },
        });

        const uploadUrl = await this.storageService.generatePresignedUploadUrl(key, dto.mimeType);

        return {
            mediaId: media.id,
            uploadUrl,
            expiresIn: 3600,
        };
    }

    async confirmUpload(userId: string, dto: ConfirmUploadDto) {
        const media = await this.prismaWrite.media.findFirst({
            where: { id: dto.uploadId, userId, status: MediaStatus.PENDING },
        });

        if (!media) {
            throw new ResourceNotFoundException('Media request', dto.uploadId);
        }

        // Usually we would check S3 if it really exists or rely on Webhooks. Assuming direct confirm for now.
        const updated = await this.prismaWrite.media.update({
            where: { id: media.id },
            data: { status: MediaStatus.READY },
        });

        return updated;
    }

    async directUpload(userId: string, dto: DirectUploadDto, file: any) {
        const key = this.storageService.generateStorageKey(userId, file.originalname);

        const bucket = dto.projectId ? 'nestlancer-private' : 'nestlancer-public';

        await this.storageService.upload(
            bucket,
            key,
            file.buffer,
            file.mimetype
        );

        const media = await this.prismaWrite.media.create({
            data: {
                userId,
                filename: file.originalname,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                fileType: dto.fileType,
                storageKey: key,
                status: MediaStatus.READY,
                projectId: dto.projectId,
                messageId: dto.messageId,
            },
        });

        return media;
    }

    @ReadOnly()
    async getStorageStats(userId: string) {
        const sum = await this.prismaRead.media.aggregate({
            where: { userId, status: MediaStatus.READY },
            _sum: { size: true },
            _count: true,
        });

        return {
            totalUsedBytes: sum._sum.size || 0,
            fileCount: sum._count,
            quotaBytes: 5 * 1024 * 1024 * 1024, // 5GB default
        };
    }

    @ReadOnly()
    async findById(id: string, userId: string) {
        const media = await this.prismaRead.media.findFirst({
            where: { id, uploaderId: userId },
        });

        if (!media) {
            throw new ResourceNotFoundException('Media', id);
        }

        return media;
    }

    async updateMetadata(id: string, userId: string, dto: UpdateMediaMetadataDto) {
        const media = await this.prismaWrite.media.findFirst({
            where: { id, uploaderId: userId },
        });

        if (!media) {
            throw new ResourceNotFoundException('Media', id);
        }

        return this.prismaWrite.media.update({
            where: { id },
            data: {
                ...(dto.filename && { filename: dto.filename }),
                ...(dto.description && { metadata: { description: dto.description } }),
            },
        });
    }

    async delete(id: string, userId: string) {
        const media = await this.prismaWrite.media.findFirst({
            where: { id, uploaderId: userId },
        });

        if (!media) {
            throw new ResourceNotFoundException('Media', id);
        }

        // Should also delete from S3 (Key usually computable / stored in metadata, assuming standard format here)
        await this.storageService.deleteFile(`users/${userId}/${media.createdAt.toISOString().split('T')[0]}/${media.id}`);

        return this.prismaWrite.media.delete({
            where: { id },
        });
    }

    async getDownloadUrl(id: string, userId: string) {
        const media = await this.prismaRead.media.findFirst({
            where: { id, uploaderId: userId },
        });

        if (!media) {
            throw new ResourceNotFoundException('Media', id);
        }

        const downloadUrl = await this.storageService.generatePresignedDownloadUrl(`users/${userId}/${media.createdAt.toISOString().split('T')[0]}/${media.id}`);

        return { downloadUrl, expiresIn: 3600 };
    }
}
