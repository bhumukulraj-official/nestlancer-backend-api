import { Injectable, Logger } from '@nestjs/common';
import { StorageProvider } from '@nestlancer/storage';
import { MediaConfig } from '../config/media.config';
import { generateUuid } from '@nestlancer/common';
import * as path from 'path';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);

    constructor(private readonly storageProvider: StorageProvider) { }

    generateStorageKey(userId: string, filename: string): string {
        const ext = path.extname(filename);
        const id = generateUuid();
        const date = new Date().toISOString().split('T')[0];
        return `users/${userId}/${date}/${id}${ext}`;
    }

    async generatePresignedUploadUrl(key: string, mimeType: string) {
        return this.storageProvider.getSignedUrl({
            bucket: MediaConfig.S3_PRIVATE_BUCKET,
            key,
            expiresIn: MediaConfig.PRESIGNED_URL_EXPIRY,
            operation: 'put',
            contentType: mimeType
        });
    }

    async generatePresignedDownloadUrl(key: string) {
        return this.storageProvider.getSignedUrl({
            bucket: MediaConfig.S3_PRIVATE_BUCKET,
            key,
            expiresIn: MediaConfig.PRESIGNED_URL_EXPIRY,
            operation: 'get'
        });
    }

    async upload(bucket: string, key: string, buffer: Buffer, contentType: string) {
        return this.storageProvider.upload(
            bucket,
            key,
            buffer,
            contentType
        );
    }

    async deleteFile(key: string) {
        return this.storageProvider.delete(
            MediaConfig.S3_PRIVATE_BUCKET,
            key
        );
    }

    async getFileSize(key: string) {
        // Mocked or omitted if not supported, typically not supported in standard interface without headObject
        // If we must have it, we can return 0 or do a HEAD request if added to interface later.
        return 0;
    }
}
