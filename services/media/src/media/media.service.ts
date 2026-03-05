import { Injectable, Logger } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService, ReadOnly } from '@nestlancer/database';
import { MediaStorageService } from '../storage/storage.service';
import { RequestUploadDto } from '../dto/request-upload.dto';
import { ConfirmUploadDto } from '../dto/confirm-upload.dto';
import { DirectUploadDto } from '../dto/direct-upload.dto';
import { UpdateMediaMetadataDto } from '../dto/update-media-metadata.dto';
import { QueryMediaDto } from '../dto/query-media.dto';
import { MediaStatus } from '../interfaces/media.interface';
import { buildPrismaSkipTake, createPaginationMeta, ResourceNotFoundException } from '@nestlancer/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
    private readonly logger = new Logger(MediaService.name);

    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly storageService: MediaStorageService,
    ) { }

    @ReadOnly()
    async findByUser(userId: string, query: QueryMediaDto) {
        const { skip, take } = buildPrismaSkipTake(query.page, query.limit);

        const where: any = { uploaderId: userId };
        if (query.fileType) where.mimeType = { contains: query.fileType };
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

    @ReadOnly()
    async findById(mediaId: string, userId: string) {
        const media = await this.prismaRead.media.findFirst({
            where: { id: mediaId, uploaderId: userId },
        });

        if (!media) {
            throw new ResourceNotFoundException('Media');
        }

        return media;
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
                metadata: {
                    storageKey: key,
                }
            },
        });

        const uploadUrl = await this.storageService.generatePresignedUploadUrl(key, dto.mimeType);

        return {
            mediaId: media.id,
            uploadUrl,
            key,
            expiresIn: 3600,
        };
    }

    async confirmUpload(userId: string, dto: { uploadId: string; providerMetadata?: any }) {
        const media = await this.prismaWrite.media.findFirst({
            where: { id: dto.uploadId, uploaderId: userId },
        });

        if (!media) {
            throw new ResourceNotFoundException('Media');
        }

        return this.prismaWrite.media.update({
            where: { id: dto.uploadId },
            data: {
                status: MediaStatus.READY,
                providerMetadata: dto.providerMetadata,
            },
        });
    }

    async directUpload(userId: string, file: any, dto: DirectUploadDto) {
        const key = this.storageService.generateStorageKey(userId, file.originalname);

        const media = await this.prismaWrite.media.create({
            data: {
                uploaderId: userId,
                filename: file.originalname,
                originalFilename: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                status: MediaStatus.READY,
                metadata: {
                    storageKey: key,
                }
            },
        });

        await this.storageService.upload(
            'nestlancer-private',
            key,
            file.buffer,
            file.mimetype,
        );

        return media;
    }

    async delete(mediaId: string, userId: string) {
        const media = await this.prismaRead.media.findFirst({
            where: { id: mediaId, uploaderId: userId },
        });

        if (!media) {
            throw new ResourceNotFoundException('Media');
        }

        const metadata = media.metadata as any;
        const storageKey = metadata?.storageKey;

        if (storageKey) {
            await this.storageService.deleteFile(storageKey);
        }

        return this.prismaWrite.media.delete({
            where: { id: mediaId },
        });
    }

    async getDownloadUrl(mediaId: string, userId: string) {
        const media = await this.prismaRead.media.findFirst({
            where: { id: mediaId, uploaderId: userId },
        });

        if (!media) {
            throw new ResourceNotFoundException('Media');
        }

        const metadata = media.metadata as any;
        const storageKey = metadata?.storageKey;

        if (!storageKey) {
            throw new ResourceNotFoundException('Storage file');
        }

        const downloadUrl = await this.storageService.generatePresignedDownloadUrl(storageKey);

        return {
            downloadUrl,
            expiresIn: 3600,
        };
    }

    async updateMetadata(mediaId: string, userId: string, dto: UpdateMediaMetadataDto) {
        const media = await this.prismaRead.media.findFirst({
            where: { id: mediaId, uploaderId: userId },
        });

        if (!media) {
            throw new ResourceNotFoundException('Media');
        }

        return this.prismaWrite.media.update({
            where: { id: mediaId },
            data: {
                filename: dto.filename,
                metadata: dto.metadata as any,
            },
        });
    }

    @ReadOnly()
    async getStorageStats(userId: string) {
        const result = await this.prismaRead.media.aggregate({
            where: { uploaderId: userId },
            _sum: { size: true },
        });

        return {
            totalUsedBytes: result._sum.size || 0,
            quotaBytes: 5 * 1024 * 1024 * 1024, // 5GB default quota
        };
    }
}
