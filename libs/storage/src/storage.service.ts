import { Injectable, Inject, Logger } from '@nestjs/common';
import { UploadResult, SignedUrlOptions, StorageProvider } from './interfaces/storage.interface';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private provider!: StorageProvider;

  constructor(@Inject('STORAGE_OPTIONS') private readonly options: { provider?: string }) {}

  async upload(bucket: string, key: string, body: Buffer, contentType: string): Promise<UploadResult> {
    return this.provider.upload(bucket, key, body, contentType);
  }

  async download(bucket: string, key: string): Promise<Buffer> { return this.provider.download(bucket, key); }
  async delete(bucket: string, key: string): Promise<void> { return this.provider.delete(bucket, key); }
  async getSignedUrl(options: SignedUrlOptions): Promise<string> { return this.provider.getSignedUrl(options); }
}
