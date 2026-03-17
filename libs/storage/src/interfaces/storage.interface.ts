import { Readable } from 'stream';

export interface StorageProvider {
  upload(
    bucket: string,
    key: string,
    body: Buffer,
    contentType: string,
    metadata?: Record<string, any>,
  ): Promise<UploadResult>;
  download(bucket: string, key: string): Promise<Buffer>;
  downloadStream(bucket: string, key: string): Promise<Readable>;
  delete(bucket: string, key: string): Promise<void>;
  getSignedUrl(options: SignedUrlOptions): Promise<string>;
  exists(bucket: string, key: string): Promise<boolean>;
  checkConnection(): Promise<void>;
  /** Returns size in bytes, or 0 if object not found / unknown. */
  getFileSize?(bucket: string, key: string): Promise<number>;
}

export interface UploadResult {
  key: string;
  url: string;
  etag: string;
  size?: number;
}

export interface SignedUrlOptions {
  bucket: string;
  key: string;
  expiresIn?: number;
  operation?: 'get' | 'put';
  contentType?: string;
}

export interface StorageModuleOptions {
  provider: 's3' | 'b2' | 'local';
  s3?: S3StorageConfig;
  local?: LocalStorageConfig;
}

export interface S3StorageConfig {
  region?: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle?: boolean;
}

export interface LocalStorageConfig {
  basePath: string;
  baseUrl?: string;
}
