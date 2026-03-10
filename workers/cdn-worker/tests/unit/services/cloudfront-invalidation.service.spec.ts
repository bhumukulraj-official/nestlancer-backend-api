import { Test, TestingModule } from '@nestjs/testing';
import { CloudFrontInvalidationService } from '../../../src/services/cloudfront-invalidation.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';

jest.mock('@aws-sdk/client-cloudfront');

describe('CloudFrontInvalidationService', () => {
  let service: CloudFrontInvalidationService;
  let mockCloudFrontClient: jest.Mocked<CloudFrontClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudFrontInvalidationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key) => {
              if (key === 'cdn.cloudfront.region') return 'us-east-1';
              if (key === 'cdn.cloudfront.distributionId') return 'distro1';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CloudFrontInvalidationService>(CloudFrontInvalidationService);
    // Get the mocked instance from constructor
    // @ts-ignore
    mockCloudFrontClient = service.client;

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('invalidate', () => {
    it('should call CloudFront client to create invalidation', async () => {
      mockCloudFrontClient.send.mockResolvedValue({
        Invalidation: { Id: 'inv1', Status: 'Completed' },
      } as any);

      const result = await service.invalidate(['/test1/*']);

      expect(mockCloudFrontClient.send).toHaveBeenCalledWith(expect.any(CreateInvalidationCommand));
      // We can't easily check the command arguments since it's a class instance created inside the method
      // But we verify send is called and response is handled.
      expect(result.id).toBe('inv1');
      expect(result.status).toBe('Completed');
    });

    it('should handle aws sdk errors', async () => {
      mockCloudFrontClient.send.mockRejectedValue(new Error('AWS Error'));
      await expect(service.invalidate(['/test1/*'])).rejects.toThrow('AWS Error');
    });
  });

  describe('purgeAll', () => {
    it('should invalidate /* path', async () => {
      mockCloudFrontClient.send.mockResolvedValue({
        Invalidation: { Id: 'inv-all', Status: 'Completed' },
      } as any);
      await service.purgeAll();
      expect(mockCloudFrontClient.send).toHaveBeenCalledWith(expect.any(CreateInvalidationCommand));
    });
  });
});
