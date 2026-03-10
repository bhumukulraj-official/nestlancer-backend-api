import { Test, TestingModule } from '@nestjs/testing';
import { ThumbnailGeneratorProcessor } from '../../../src/processors/thumbnail-generator.processor';
import { StorageService } from '@nestlancer/storage';
import { ImageProcessingService } from '../../../src/services/image-processing.service';
import { VideoProcessingService } from '../../../src/services/video-processing.service';

describe('ThumbnailGeneratorProcessor', () => {
  let processor: ThumbnailGeneratorProcessor;
  let storage: jest.Mocked<StorageService>;
  let imageService: jest.Mocked<ImageProcessingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThumbnailGeneratorProcessor,
        {
          provide: StorageService,
          useValue: { download: jest.fn(), upload: jest.fn() },
        },
        {
          provide: ImageProcessingService,
          useValue: { generateThumbnail: jest.fn() },
        },
        {
          provide: VideoProcessingService,
          useValue: {},
        },
      ],
    }).compile();

    processor = module.get<ThumbnailGeneratorProcessor>(ThumbnailGeneratorProcessor);
    storage = module.get(StorageService);
    imageService = module.get(ImageProcessingService);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('generate', () => {
    it('should generate and upload thumbnail for image/ types', async () => {
      const originalBuffer = Buffer.from('original');
      storage.download.mockResolvedValue(originalBuffer);

      const thumbBuffer = Buffer.from('thumb');
      imageService.generateThumbnail.mockResolvedValue(thumbBuffer);

      storage.upload.mockResolvedValue({ url: 'http://test' } as any);

      const result = await processor.generate('image.jpg', 'image/jpeg');

      expect(storage.download).toHaveBeenCalledWith('nestlancer-private', 'image.jpg');
      expect(imageService.generateThumbnail).toHaveBeenCalledWith(originalBuffer);
      expect(storage.upload).toHaveBeenCalledWith(
        'nestlancer-private',
        'thumb_image.jpg.webp',
        thumbBuffer,
        'image/webp',
      );

      expect(result).toBe('thumb_image.jpg.webp');
    });

    it('should return thumbnail key for video/ types (mocked for now)', async () => {
      // Implementation currently incomplete for video thumbnail extraction
      const result = await processor.generate('video.mp4', 'video/mp4');

      expect(result).toBe('thumb_video.mp4.webp');
      expect(storage.download).not.toHaveBeenCalled();
      expect(storage.upload).not.toHaveBeenCalled();
    });

    it('should return thumbnail key for unknown types without doing anything', async () => {
      const result = await processor.generate('doc.pdf', 'application/pdf');

      expect(result).toBe('thumb_doc.pdf.webp');
      expect(storage.download).not.toHaveBeenCalled();
      expect(storage.upload).not.toHaveBeenCalled();
    });
  });
});
