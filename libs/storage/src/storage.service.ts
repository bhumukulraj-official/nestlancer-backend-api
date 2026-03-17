import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import {
  UploadResult,
  SignedUrlOptions,
  StorageProvider,
  StorageModuleOptions,
} from './interfaces/storage.interface';
import { LocalProvider } from './providers/local.provider';
import { CloudflareR2Provider } from './providers/cloudflare-r2.provider';

import { Readable } from 'stream';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private provider!: StorageProvider;
  private primaryProvider?: StorageProvider;
  private fallbackProvider?: StorageProvider;

  constructor(
    @Inject('STORAGE_OPTIONS') private readonly options: StorageModuleOptions,
    @Inject('S3_CONFIG') private readonly s3Config: any,
    @Inject('LOCAL_STORAGE_CONFIG') private readonly localConfig: any,
  ) { }

  onModuleInit(): void {
    const local = new LocalProvider(this.localConfig);

    switch (this.options.provider) {
      case 'b2':
        this.primaryProvider = new CloudflareR2Provider(this.s3Config);
        this.fallbackProvider = local;
        this.provider = this.primaryProvider;
        break;
      case 'local':
      default:
        this.provider = local;
        break;
    }
    this.logger.log(`StorageService initialized with provider: ${this.options.provider}`);
  }

  async upload(
    bucket: string,
    key: string,
    body: Buffer,
    contentType: string,
    metadata?: Record<string, any>,
  ): Promise<UploadResult> {
    if (this.options.provider === 'b2' && this.primaryProvider && this.fallbackProvider) {
      try {
        return await this.primaryProvider.upload(bucket, key, body, contentType, metadata);
      } catch (error: any) {
        this.logger.warn(
          `Cloud storage upload failed for bucket ${bucket}, falling back to local: ${error.message}`,
        );
        return await this.fallbackProvider.upload(bucket, key, body, contentType, {
          ...metadata,
          needsSync: true,
        });
      }
    }
    return this.provider.upload(bucket, key, body, contentType, metadata);
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

  async checkConnection(): Promise<void> {
    await this.provider.checkConnection();
  }

  /**
   * Returns the primary and fallback providers.
   * Useful for background synchronization tasks.
   */
  getProviders(): { primary?: StorageProvider; fallback?: StorageProvider } {
    return {
      primary: this.primaryProvider,
      fallback: this.fallbackProvider,
    };
  }

  async getFileSize(bucket: string, key: string): Promise<number> {
    if (typeof this.provider.getFileSize === 'function') {
      return this.provider.getFileSize(bucket, key);
    }
    return 0;
  }
}
