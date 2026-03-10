import { Injectable, Logger, Inject } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { createHash } from 'crypto';
import {
  StorageProvider,
  UploadResult,
  SignedUrlOptions,
  LocalStorageConfig,
} from '../interfaces/storage.interface';

@Injectable()
export class LocalProvider implements StorageProvider {
  private readonly logger = new Logger(LocalProvider.name);

  constructor(
    @Inject('LOCAL_STORAGE_CONFIG')
    private readonly config: LocalStorageConfig,
  ) {
    this.logger.log(`LocalProvider initialized (basePath: ${config.basePath})`);
  }

  async upload(
    bucket: string,
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<UploadResult> {
    const filePath = this.resolvePath(bucket, key);
    await fs.mkdir(dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, body);

    const etag = createHash('md5').update(body).digest('hex');

    // Write metadata alongside the file
    const metaPath = filePath + '.meta.json';
    await fs.writeFile(
      metaPath,
      JSON.stringify({
        contentType,
        size: body.length,
        etag,
        uploadedAt: new Date().toISOString(),
      }),
    );

    this.logger.debug(`Uploaded ${key} to ${bucket} (${body.length} bytes)`);

    return {
      key,
      url: this.buildUrl(bucket, key),
      etag,
      size: body.length,
    };
  }

  async download(bucket: string, key: string): Promise<Buffer> {
    const filePath = this.resolvePath(bucket, key);
    const buffer = await fs.readFile(filePath);
    this.logger.debug(`Downloaded ${key} from ${bucket} (${buffer.length} bytes)`);
    return buffer;
  }

  async delete(bucket: string, key: string): Promise<void> {
    const filePath = this.resolvePath(bucket, key);
    const metaPath = filePath + '.meta.json';

    await fs.unlink(filePath).catch(() => {});
    await fs.unlink(metaPath).catch(() => {});

    this.logger.debug(`Deleted ${key} from ${bucket}`);
  }

  async getSignedUrl(options: SignedUrlOptions): Promise<string> {
    // Local provider doesn't support true signed URLs.
    // Return a direct file URL (suitable for dev only).
    const url = this.buildUrl(options.bucket, options.key);
    this.logger.debug(`Generated local URL for ${options.bucket}/${options.key}`);
    return url;
  }

  async exists(bucket: string, key: string): Promise<boolean> {
    const filePath = this.resolvePath(bucket, key);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getFileSize(bucket: string, key: string): Promise<number> {
    const filePath = this.resolvePath(bucket, key);
    try {
      const stat = await fs.stat(filePath);
      return stat.size;
    } catch {
      return 0;
    }
  }

  private resolvePath(bucket: string, key: string): string {
    return join(this.config.basePath, bucket, key);
  }

  private buildUrl(bucket: string, key: string): string {
    const base = this.config.baseUrl || `file://${this.config.basePath}`;
    return `${base}/${bucket}/${key}`;
  }
}
