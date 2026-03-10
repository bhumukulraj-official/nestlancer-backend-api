/**
 * E2E MinIO/S3 Helper
 *
 * Utilities for asserting object storage state in E2E tests.
 * Uses the AWS S3 SDK since MinIO is S3-compatible.
 */

import { S3Client, HeadObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

export interface MinIOConfig {
    endpoint?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
}

export class E2EMinIOHelper {
    private client: S3Client;

    constructor(config: MinIOConfig = {}) {
        this.client = new S3Client({
            endpoint: config.endpoint || process.env.MINIO_ENDPOINT || 'http://localhost:9000',
            region: config.region || 'us-east-1',
            credentials: {
                accessKeyId: config.accessKeyId || process.env.MINIO_ROOT_USER || 'minioadmin',
                secretAccessKey: config.secretAccessKey || process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
            },
            forcePathStyle: true, // Required for MinIO
        });
    }

    /**
     * Check if an object exists in a bucket.
     */
    async objectExists(bucket: string, key: string): Promise<boolean> {
        try {
            await this.client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Delete an object from a bucket.
     */
    async deleteObject(bucket: string, key: string): Promise<void> {
        try {
            await this.client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
        } catch {
            // Ignore errors – object may not exist
        }
    }

    /**
     * List objects in a bucket with an optional prefix.
     */
    async listObjects(
        bucket: string,
        prefix?: string,
        maxKeys: number = 100,
    ): Promise<string[]> {
        try {
            const response = await this.client.send(
                new ListObjectsV2Command({
                    Bucket: bucket,
                    Prefix: prefix,
                    MaxKeys: maxKeys,
                }),
            );
            return (response.Contents || []).map((obj) => obj.Key || '').filter(Boolean);
        } catch {
            return [];
        }
    }

    /**
     * Delete all objects with a given prefix in a bucket.
     */
    async deleteByPrefix(bucket: string, prefix: string): Promise<void> {
        const keys = await this.listObjects(bucket, prefix);
        for (const key of keys) {
            await this.deleteObject(bucket, key);
        }
    }

    /**
     * Wait for an object to appear in a bucket (polling).
     */
    async waitForObject(
        bucket: string,
        key: string,
        timeoutMs: number = 30000,
        intervalMs: number = 1000,
    ): Promise<boolean> {
        const startTime = Date.now();
        while (Date.now() - startTime < timeoutMs) {
            if (await this.objectExists(bucket, key)) {
                return true;
            }
            await new Promise((resolve) => setTimeout(resolve, intervalMs));
        }
        return false;
    }
}

/**
 * Create a new MinIO helper.
 */
export function createMinIOHelper(config?: MinIOConfig): E2EMinIOHelper {
    return new E2EMinIOHelper(config);
}
