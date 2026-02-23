export interface StorageProvider {
  upload(bucket: string, key: string, body: Buffer, contentType: string): Promise<UploadResult>;
  download(bucket: string, key: string): Promise<Buffer>;
  delete(bucket: string, key: string): Promise<void>;
  getSignedUrl(options: SignedUrlOptions): Promise<string>;
}
export interface UploadResult { key: string; url: string; etag: string; }
export interface SignedUrlOptions { bucket: string; key: string; expiresIn?: number; operation?: 'get' | 'put'; }
