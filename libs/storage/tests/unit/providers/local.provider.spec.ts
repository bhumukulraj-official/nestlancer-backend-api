import { LocalProvider } from '../../../src/providers/local.provider';
import { promises as fs } from 'fs';
import { join } from 'path';

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(undefined),
    access: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('LocalProvider', () => {
  let provider: LocalProvider;
  const mockConfig = { basePath: '/tmp/storage' };

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new LocalProvider(mockConfig);
  });

  it('should upload a file', async () => {
    const result = await provider.upload(
      'test-bucket',
      'test.txt',
      Buffer.from('data'),
      'text/plain',
    );

    expect(fs.mkdir).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalledWith(
      join('/tmp/storage', 'test-bucket', 'test.txt'),
      expect.any(Buffer),
    );
    expect(result.url).toBe('file:///tmp/storage/test-bucket/test.txt');
    expect(result.size).toBe(4);
  });

  it('should download a file', async () => {
    (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from('data'));

    const buffer = await provider.download('test-bucket', 'test.txt');

    expect(fs.readFile).toHaveBeenCalledWith(join('/tmp/storage', 'test-bucket', 'test.txt'));
    expect(buffer.toString()).toBe('data');
  });

  it('should delete a file', async () => {
    await provider.delete('test-bucket', 'test.txt');

    expect(fs.unlink).toHaveBeenCalledWith(join('/tmp/storage', 'test-bucket', 'test.txt'));
    expect(fs.unlink).toHaveBeenCalledWith(
      join('/tmp/storage', 'test-bucket', 'test.txt.meta.json'),
    );
  });

  it('should generate local link for signed url', async () => {
    const url = await provider.getSignedUrl({
      bucket: 'test-bucket',
      key: 'test.txt',
      operation: 'get',
    });

    expect(url).toBe('file:///tmp/storage/test-bucket/test.txt');
  });

  it('should check if file exists', async () => {
    (fs.access as jest.Mock)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('ENOENT'));

    expect(await provider.exists('test-bucket', 'exists.txt')).toBe(true);
    expect(await provider.exists('test-bucket', 'missing.txt')).toBe(false);
  });
});
