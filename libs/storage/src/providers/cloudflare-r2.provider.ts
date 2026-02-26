import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  StorageProvider,
  UploadResult,
  SignedUrlOptions,
  S3StorageConfig,
} from '../interfaces/storage.interface';

/**
 * Cloudflare R2 provider — S3-compatible but uses Cloudflare's endpoint.
 * R2 has no egress fees and supports the S3 API.
 */
@Injectable()
export class CloudflareR2Provider implements StorageProvider {
  private readonly logger = new Logger(CloudflareR2Provider.name);
  private readonly client: S3Client;

  constructor(@Inject('S3_CONFIG') private readonly config: S3StorageConfig) {
    if (!config.endpoint) {
      throw new Error('CloudflareR2Provider requires an endpoint (e.g., https://<account-id>.r2.cloudflarestorage.com)');
    }

    this.client = new S3Client({
      region: 'auto', // R2 uses 'auto' for region
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true, // Required for R2
    });
    this.logger.log(`CloudflareR2Provider initialized (endpoint: ${config.endpoint})`);
  }

  async upload(bucket: string, key: string, body: Buffer, contentType: string): Promise<UploadResult> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ContentLength: body.length,
    });

    const result = await this.client.send(command);
    this.logger.debug(`Uploaded ${key} to R2 bucket ${bucket} (${body.length} bytes)`);

    return {
      key,
      url: `${this.config.endpoint}/${bucket}/${key}`,
      etag: result.ETag?.replace(/"/g, '') || '',
      size: body.length,
    };
  }

  async download(bucket: string, key: string): Promise<Buffer> {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const result = await this.client.send(command);

    if (!result.Body) {
      throw new Error(`Empty body for R2 ${bucket}/${key}`);
    }

    const chunks: Uint8Array[] = [];
    const stream = result.Body as AsyncIterable<Uint8Array>;
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    this.logger.debug(`Downloaded ${key} from R2 bucket ${bucket}`);
    return Buffer.concat(chunks);
  }

  async delete(bucket: string, key: string): Promise<void> {
    const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    await this.client.send(command);
    this.logger.debug(`Deleted ${key} from R2 bucket ${bucket}`);
  }

  async getSignedUrl(options: SignedUrlOptions): Promise<string> {
    const expiresIn = options.expiresIn || 3600;

    const command = options.operation === 'put'
      ? new PutObjectCommand({
        Bucket: options.bucket,
        Key: options.key,
        ContentType: options.contentType,
      })
      : new GetObjectCommand({
        Bucket: options.bucket,
        Key: options.key,
      });

    const url = await awsGetSignedUrl(this.client, command, { expiresIn });
    this.logger.debug(`Generated R2 signed URL for ${options.bucket}/${options.key} (expires: ${expiresIn}s)`);
    return url;
  }

  async exists(bucket: string, key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }
}
