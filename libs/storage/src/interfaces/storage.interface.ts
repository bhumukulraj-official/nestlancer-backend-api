export interface StorageProvider {
  upload(bucket: string, key: string, body: Buffer, contentType: string): Promise<UploadResult>;
  download(bucket: string, key: string): Promise<Buffer>;
  delete(bucket: string, key: string): Promise<void>;
  getSignedUrl(options: SignedUrlOptions): Promise<string>;
  exists(bucket: string, key: string): Promise<boolean>;
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
