import { CloudflareR2Provider } from '../../../src/providers/cloudflare-r2.provider';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('CloudflareR2Provider', () => {
  let provider: CloudflareR2Provider;
  const mockConfig = {
    endpoint: 'https://token.r2.cloudflarestorage.com',
    accessKeyId: 'test-key',
    secretAccessKey: 'test-secret',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new CloudflareR2Provider(mockConfig);
  });

  it('should upload a file and return result', async () => {
    const mockSend = jest.fn().mockResolvedValue({ ETag: '"test-etag"' });
    (S3Client.prototype.send as jest.Mock) = mockSend;

    const result = await provider.upload(
      'test-bucket',
      'test-key.txt',
      Buffer.from('hello'),
      'text/plain',
    );

    expect(mockSend).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    expect(result.key).toBe('test-key.txt');
    expect(result.etag).toBe('test-etag');
    expect(result.size).toBe(5);
    expect(result.url).toBe('https://token.r2.cloudflarestorage.com/test-bucket/test-key.txt');
  });

  it('should throw error if constructor lacks endpoint', () => {
    expect(() => {
      new CloudflareR2Provider({} as any);
    }).toThrow();
  });

  it('should download a file', async () => {
    // Mock an async iterable for the stream
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        yield Buffer.from('hello');
        yield Buffer.from(' r2');
      },
    };

    const mockSend = jest.fn().mockResolvedValue({ Body: mockStream });
    (S3Client.prototype.send as jest.Mock) = mockSend;

    const buffer = await provider.download('test-bucket', 'test-key.txt');

    expect(mockSend).toHaveBeenCalledWith(expect.any(GetObjectCommand));
    expect(buffer.toString()).toBe('hello r2');
  });

  it('should delete a file', async () => {
    const mockSend = jest.fn().mockResolvedValue({});
    (S3Client.prototype.send as jest.Mock) = mockSend;

    await provider.delete('test-bucket', 'test-key.txt');

    expect(mockSend).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
  });

  it('should generate a signed url for get', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue('https://signed-url.com/r2');

    const url = await provider.getSignedUrl({
      bucket: 'test-bucket',
      key: 'test-key.txt',
      operation: 'get',
      expiresIn: 3600,
    });

    expect(getSignedUrl).toHaveBeenCalled();
    expect(url).toBe('https://signed-url.com/r2');
  });

  it('should check if file exists', async () => {
    const mockSend = jest
      .fn()
      .mockResolvedValueOnce({}) // exists
      .mockRejectedValueOnce(new Error('Not found')); // doesn't exist

    (S3Client.prototype.send as jest.Mock) = mockSend;

    expect(await provider.exists('test-bucket', 'exists.txt')).toBe(true);
    expect(await provider.exists('test-bucket', 'missing.txt')).toBe(false);
  });
});
