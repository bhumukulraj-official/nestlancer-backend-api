import { Injectable, Logger } from '@nestjs/common';
import { StorageProvider, UploadResult, SignedUrlOptions } from '../interfaces/storage.interface';

@Injectable()
export class S3Provider implements StorageProvider {
  private readonly logger = new Logger(S3Provider.name);

  async upload(bucket: string, key: string, body: Buffer, contentType: string): Promise<UploadResult> {
    void bucket; void key; void body; void contentType;
    return { key, url: '', etag: '' };
  }
  async download(bucket: string, key: string): Promise<Buffer> { void bucket; void key; return Buffer.from(''); }
  async delete(bucket: string, key: string): Promise<void> { void bucket; void key; }
  async getSignedUrl(options: SignedUrlOptions): Promise<string> { void options; return ''; }
}
