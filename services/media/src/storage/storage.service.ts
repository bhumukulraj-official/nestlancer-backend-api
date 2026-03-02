import { Injectable, Logger } from '@nestjs/common';
import { S3StorageProvider } from '@nestlancer/storage';
import { MediaConfig } from '../config/media.config';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);

    constructor(private readonly s3StorageService: S3StorageProvider) { }

    generateStorageKey(userId: string, filename: string): string {
        const ext = path.extname(filename);
        const id = randomUUID();
        const date = new Date().toISOString().split('T')[0];
        return `users/${userId}/${date}/${id}${ext}`;
    }

    async generatePresignedUploadUrl(key: string, mimeType: string) {
        return this.s3StorageService.getPresignedPutUrl(
            MediaConfig.S3_PRIVATE_BUCKET,
            key,
            MediaConfig.PRESIGNED_URL_EXPIRY,
            mimeType
        );
    }

    async generatePresignedDownloadUrl(key: string) {
        return this.s3StorageService.getPresignedGetUrl(
            MediaConfig.S3_PRIVATE_BUCKET,
            key,
            MediaConfig.PRESIGNED_URL_EXPIRY
        );
    }

    async initiateMultipartUpload(key: string, mimeType: string) {
        return this.s3StorageService.createMultipartUpload(
            MediaConfig.S3_PRIVATE_BUCKET,
            key,
            mimeType
        );
    }

    async uploadPart(key: string, uploadId: string, partNumber: number, buffer: Buffer) {
        return this.s3StorageService.uploadPart(
            MediaConfig.S3_PRIVATE_BUCKET,
            key,
            uploadId,
            partNumber,
            buffer
        );
    }

    async completeMultipartUpload(key: string, uploadId: string, parts: any[]) {
        return this.s3StorageService.completeMultipartUpload(
            MediaConfig.S3_PRIVATE_BUCKET,
            key,
            uploadId,
            parts
        );
    }

    async deleteFile(key: string) {
        return this.s3StorageService.deleteFile(
            MediaConfig.S3_PRIVATE_BUCKET,
            key
        );
    }

    async getFileSize(key: string) {
        const meta = await this.s3StorageService.getFileMetadata(
            MediaConfig.S3_PRIVATE_BUCKET,
            key
        );
        return meta?.ContentLength || 0;
    }
}
