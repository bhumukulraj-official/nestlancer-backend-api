import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { StorageService } from '@nestlancer/storage';
import { BusinessLogicException } from '@nestlancer/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RequestAttachmentsService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly storageService: StorageService,
        private readonly config: ConfigService,
    ) { }

    async getAttachments(userId: string, requestId: string) {
        const request = await this.prismaRead.projectRequest.findFirst({
            where: { id: requestId, userId, deletedAt: null },
            include: { attachments: true } as any
        });

        if (!request) throw new BusinessLogicException('Request not found', 'REQUEST_001');

        return (request as any).attachments.map((a: any) => ({
            id: a.id,
            filename: a.filename,
            url: a.fileUrl,
            type: a.mimeType,
            size: a.size,
            uploadedAt: a.createdAt
        }));
    }

    async addAttachment(userId: string, requestId: string, file: any) {
        const request = await this.prismaRead.projectRequest.findFirst({
            where: { id: requestId, userId, deletedAt: null },
            include: { _count: { select: { attachments: true } } } as any
        });

        if (!request) throw new BusinessLogicException('Request not found', 'REQUEST_001');

        if (request.status !== 'DRAFT' && request.status !== 'CHANGES_REQUESTED') {
            throw new BusinessLogicException('Cannot modify submitted request', 'REQUEST_003');
        }

        const maxCount = this.config.get<number>('requestsService.attachments.maxCount') || 10;
        if ((request as any)._count.attachments >= maxCount) {
            throw new BusinessLogicException('Too many attachments', 'REQUEST_011');
        }

        const allowedMimeTypes = this.config.get<string[]>('requestsService.attachments.allowedMimeTypes') || [];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BusinessLogicException('Unsupported file format', 'REQUEST_012'); // Or new error code
        }

        const maxSize = this.config.get<number>('requestsService.attachments.maxSize') || 10485760;
        if (file.size > maxSize) {
            throw new BusinessLogicException('File too large', 'REQUEST_012');
        }

        const bucket = this.config.get<string>('requestsService.attachments.s3Bucket') || 'nestlancer-requests';
        const key = `requests/${requestId}/${Date.now()}_${file.originalname}`;

        const uploadResult = await this.storageService.upload(bucket, key, file.buffer, file.mimetype);
        const url = uploadResult.url;

        const attachment = await this.prismaWrite.requestAttachment.create({
            data: {
                requestId,
                filename: file.originalname,
                fileUrl: url,
                mimeType: file.mimetype,
                size: file.size,
            }
        });

        return {
            id: attachment.id,
            filename: attachment.filename,
            url: attachment.fileUrl,
            type: attachment.mimeType,
            size: attachment.size
        };
    }

    async removeAttachment(userId: string, requestId: string, attachmentId: string) {
        const request = await this.prismaRead.projectRequest.findFirst({
            where: { id: requestId, userId, deletedAt: null }
        });

        if (!request) throw new BusinessLogicException('Request not found', 'REQUEST_001');

        if (request.status !== 'DRAFT' && request.status !== 'CHANGES_REQUESTED') {
            throw new BusinessLogicException('Cannot modify submitted request', 'REQUEST_003');
        }

        const attachment = await this.prismaRead.requestAttachment.findFirst({
            where: { id: attachmentId, requestId }
        });

        if (!attachment) throw new BusinessLogicException('Attachment not found', 'REQUEST_012');

        await this.prismaWrite.requestAttachment.delete({
            where: { id: attachmentId }
        });

        // Optionally delete from S3
        // await this.storageService.deleteFile(attachment.fileUrl);

        return true;
    }
}
