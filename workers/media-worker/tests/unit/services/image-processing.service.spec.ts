import { Test, TestingModule } from '@nestjs/testing';
import { ImageProcessingService } from '../../../src/services/image-processing.service';
import sharp from 'sharp';

jest.mock('sharp');

describe('ImageProcessingService', () => {
  let service: ImageProcessingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageProcessingService],
    }).compile();

    service = module.get<ImageProcessingService>(ImageProcessingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('resize', () => {
    it('should resize image based on variant properties', async () => {
      const mockToBuffer = jest.fn().mockResolvedValue(Buffer.from('resized'));
      const mockResize = jest.fn().mockReturnValue({ toBuffer: mockToBuffer });
      (sharp as unknown as jest.Mock).mockReturnValue({ resize: mockResize });

      const inputBuffer = Buffer.from('input');
      const variant = { name: 'test', width: 100, height: 100, fit: 'cover' };

      const result = await service.resize(inputBuffer, variant as any);

      expect(sharp).toHaveBeenCalledWith(inputBuffer);
      expect(mockResize).toHaveBeenCalledWith(100, 100, { fit: 'cover' });
      expect(mockToBuffer).toHaveBeenCalled();
      expect(result).toEqual(Buffer.from('resized'));
    });
  });

  describe('compress', () => {
    it('should compress image using webp format', async () => {
      const mockToBuffer = jest.fn().mockResolvedValue(Buffer.from('compressed'));
      const mockWebp = jest.fn().mockReturnValue({ toBuffer: mockToBuffer });
      (sharp as unknown as jest.Mock).mockReturnValue({ webp: mockWebp });

      const inputBuffer = Buffer.from('input');

      const result = await service.compress(inputBuffer, 85);

      expect(sharp).toHaveBeenCalledWith(inputBuffer);
      expect(mockWebp).toHaveBeenCalledWith({ quality: 85 });
      expect(mockToBuffer).toHaveBeenCalled();
      expect(result).toEqual(Buffer.from('compressed'));
    });
  });

  describe('extractMetadata', () => {
    it('should extract metadata from image', async () => {
      const mockMetadataData = {
        width: 800,
        height: 600,
        format: 'jpeg',
        space: 'srgb',
        exif: Buffer.from(''),
      };
      const mockMetadataFn = jest.fn().mockResolvedValue(mockMetadataData);
      (sharp as unknown as jest.Mock).mockReturnValue({ metadata: mockMetadataFn });

      const inputBuffer = Buffer.from('input');

      const result = await service.extractMetadata(inputBuffer);

      expect(sharp).toHaveBeenCalledWith(inputBuffer);
      expect(mockMetadataFn).toHaveBeenCalled();
      expect(result).toEqual({
        width: 800,
        height: 600,
        format: 'jpeg',
        colorSpace: 'srgb',
        exif: 'present',
      });
    });

    it('should handle image without exif', async () => {
      const mockMetadataData = { width: 800, height: 600, format: 'jpeg', space: 'srgb' };
      const mockMetadataFn = jest.fn().mockResolvedValue(mockMetadataData);
      (sharp as unknown as jest.Mock).mockReturnValue({ metadata: mockMetadataFn });

      const inputBuffer = Buffer.from('input');

      const result = await service.extractMetadata(inputBuffer);

      expect(result.exif).toBeUndefined();
    });
  });

  describe('generateThumbnail', () => {
    it('should generate a 300x200 70-quality webp thumbnail', async () => {
      const mockToBuffer = jest.fn().mockResolvedValue(Buffer.from('thumb'));
      const mockWebp = jest.fn().mockReturnValue({ toBuffer: mockToBuffer });
      const mockResize = jest.fn().mockReturnValue({ webp: mockWebp });
      (sharp as unknown as jest.Mock).mockReturnValue({ resize: mockResize });

      const inputBuffer = Buffer.from('input');

      const result = await service.generateThumbnail(inputBuffer);

      expect(sharp).toHaveBeenCalledWith(inputBuffer);
      expect(mockResize).toHaveBeenCalledWith(300, 200, { fit: 'cover' });
      expect(mockWebp).toHaveBeenCalledWith({ quality: 70 });
      expect(mockToBuffer).toHaveBeenCalled();
      expect(result).toEqual(Buffer.from('thumb'));
    });
  });
});
