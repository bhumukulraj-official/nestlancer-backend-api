import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MediaWorkerService } from '../../src/services/media-worker.service';
import { VirusScanProcessor } from '../../src/processors/virus-scan.processor';
import { ImageResizeProcessor } from '../../src/processors/image-resize.processor';
import { MetadataExtractorProcessor } from '../../src/processors/metadata-extractor.processor';
import { ThumbnailGeneratorProcessor } from '../../src/processors/thumbnail-generator.processor';
import { PrismaWriteService } from '@nestlancer/database';
import { LoggerService } from '@nestlancer/logger';
import { MediaContext, MediaJobType } from '../../src/interfaces/media-job.interface';
import { MediaStatus } from '@prisma/client';

describe('MediaWorkerService', () => {
  let service: MediaWorkerService;
  let prisma: PrismaWriteService;
  let virusScan: VirusScanProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaWorkerService,
        {
          provide: VirusScanProcessor,
          useValue: { scanFile: jest.fn() },
        },
        {
          provide: ImageResizeProcessor,
          useValue: { process: jest.fn() },
        },
        {
          provide: MetadataExtractorProcessor,
          useValue: { extract: jest.fn() },
        },
        {
          provide: ThumbnailGeneratorProcessor,
          useValue: { generate: jest.fn() },
        },
        {
          provide: PrismaWriteService,
          useValue: {
            media: {
              update: jest.fn(),
            },
          },
        },
        {
          provide: LoggerService,
          useValue: { log: jest.fn(), error: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('nestlancer-private') },
        },
      ],
    }).compile();

    service = module.get<MediaWorkerService>(MediaWorkerService);
    prisma = module.get<PrismaWriteService>(PrismaWriteService);
    virusScan = module.get<VirusScanProcessor>(VirusScanProcessor);
  });

  it('should process a clean image job', async () => {
    const job = {
      mediaId: '1',
      s3Key: 'test.jpg',
      contentType: 'image/jpeg',
      context: MediaContext.PROJECT,
      userId: 'user1',
      type: MediaJobType.IMAGE_PROCESS,
    };

    jest.spyOn(virusScan, 'scanFile').mockResolvedValue({ isInfected: false });
    jest.spyOn(prisma.media, 'update').mockResolvedValue({} as any);

    await service.processJob(job);

    expect(prisma.media.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '1' },
        data: { status: MediaStatus.PROCESSING },
      }),
    );
    expect(prisma.media.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '1' },
        data: expect.objectContaining({
          status: MediaStatus.READY,
        }),
      }),
    );
  });

  it('should quarantine an infected file', async () => {
    const job = {
      mediaId: '2',
      s3Key: 'virus.exe',
      contentType: 'application/x-msdownload',
      context: MediaContext.PROJECT,
      userId: 'user1',
      type: MediaJobType.VIRUS_SCAN,
    };

    jest
      .spyOn(virusScan, 'scanFile')
      .mockResolvedValue({ isInfected: true, virusName: 'Eicar-Test-Signature' });
    jest.spyOn(prisma.media, 'update').mockResolvedValue({} as any);

    await service.processJob(job);

    expect(prisma.media.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: MediaStatus.QUARANTINED,
        }),
      }),
    );
  });
});
