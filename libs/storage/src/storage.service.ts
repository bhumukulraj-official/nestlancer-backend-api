import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import {
  UploadResult,
  SignedUrlOptions,
  StorageProvider,
  StorageModuleOptions,
} from './interfaces/storage.interface';
import { S3Provider } from './providers/s3.provider';
import { LocalProvider } from './providers/local.provider';
import { CloudflareR2Provider } from './providers/cloudflare-r2.provider';

import { Readable } from 'stream';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private provider!: StorageProvider;

  constructor(
    @Inject('STORAGE_OPTIONS') private readonly options: StorageModuleOptions,
    @Inject('S3_CONFIG') private readonly s3Config: any,
    @Inject('LOCAL_STORAGE_CONFIG') private readonly localConfig: any,
  ) { }

  onModuleInit(): void {
    switch (this.options.provider) {
      case 'b2':
      case 's3':
        if (this.options.provider === 'b2') {
          this.provider = new CloudflareR2Provider(this.s3Config);
        } else {
          this.provider = new S3Provider(this.s3Config);
        }
        break;
      case 'local':
      default:
        this.provider = new LocalProvider(this.localConfig);
        break;
    }
    this.logger.log(`StorageService initialized with provider: ${this.options.provider}`);
  }

  async upload(
    bucket: string,
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<UploadResult> {
    return this.provider.upload(bucket, key, body, contentType);
  }

  async download(bucket: string, key: string): Promise<Buffer> {
    return this.provider.download(bucket, key);
  }

  async downloadStream(bucket: string, key: string): Promise<Readable> {
    return this.provider.downloadStream(bucket, key);
  }

  async delete(bucket: string, key: string): Promise<void> {
    return this.provider.delete(bucket, key);
  }

  async getSignedUrl(options: SignedUrlOptions): Promise<string> {
    return this.provider.getSignedUrl(options);
  }

  async exists(bucket: string, key: string): Promise<boolean> {
    return this.provider.exists(bucket, key);
  }

  async getFileSize(bucket: string, key: string): Promise<number> {
    if (typeof this.provider.getFileSize === 'function') {
      return this.provider.getFileSize(bucket, key);
    }
    return 0;
  }
}
