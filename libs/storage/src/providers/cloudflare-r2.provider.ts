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
  private client!: S3Client;

  constructor(@Inject('S3_CONFIG') private readonly config: S3StorageConfig) {
    if (config.endpoint) {
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
    } else {
      this.logger.warn(
        'CloudflareR2Provider: No endpoint provided, client will not be initialized',
      );
    }
  }

  private checkClient() {
    if (!this.client) {
      throw new Error(
        'CloudflareR2Provider requires an endpoint and must be properly initialized before use',
      );
    }
  }

  async upload(
    bucket: string,
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<UploadResult> {
    this.checkClient();
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
    const stream = await this.downloadStream(bucket, key);
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  async downloadStream(bucket: string, key: string): Promise<any> {
    this.checkClient();
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const result = await this.client.send(command);

    if (!result.Body) {
      throw new Error(`Empty body for R2 ${bucket}/${key}`);
    }

    this.logger.debug(`Streaming download of ${key} from R2 bucket ${bucket}`);
    return result.Body as any;
  }

  async delete(bucket: string, key: string): Promise<void> {
    this.checkClient();
    const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    await this.client.send(command);
    this.logger.debug(`Deleted ${key} from R2 bucket ${bucket}`);
  }

  async getSignedUrl(options: SignedUrlOptions): Promise<string> {
    this.checkClient();
    const expiresIn = options.expiresIn || 3600;

    const command =
      options.operation === 'put'
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
    this.logger.debug(
      `Generated R2 signed URL for ${options.bucket}/${options.key} (expires: ${expiresIn}s)`,
    );
    return url;
  }

  async exists(bucket: string, key: string): Promise<boolean> {
    this.checkClient();
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  async getFileSize(bucket: string, key: string): Promise<number> {
    this.checkClient();
    try {
      const result = await this.client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return result.ContentLength ?? 0;
    } catch {
      return 0;
    }
  }
}
