import { Test, TestingModule } from '@nestjs/testing';
import { PostViewsService } from '../../../src/services/post-views.service';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { CacheService } from '@nestlancer/cache';
import { ConfigService } from '@nestjs/config';

describe('PostViewsService', () => {
  let service: PostViewsService;
  let prismaWrite: jest.Mocked<PrismaWriteService>;
  let cacheService: jest.Mocked<CacheService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostViewsService,
        {
          provide: PrismaWriteService,
          useValue: {
            blogPost: {
              update: jest.fn(),
            },
          },
        },
        {
          provide: PrismaReadService,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PostViewsService>(PostViewsService);
    prismaWrite = module.get(PrismaWriteService);
    cacheService = module.get(CacheService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordView', () => {
    it('should increment view count if not recently viewed', async () => {
      configService.get.mockReturnValue(1); // 1 hour debounce
      cacheService.get.mockResolvedValue(null);

      await service.recordView('post-1', 'ip-hash');

      expect(cacheService.get).toHaveBeenCalledWith('blog_view:post-1:ip-hash');
      expect(prismaWrite.blogPost.update).toHaveBeenCalledWith({
        where: { id: 'post-1' },
        data: { viewCount: { increment: 1 } },
      });
      expect(cacheService.set).toHaveBeenCalledWith('blog_view:post-1:ip-hash', '1', 3600);
    });

    it('should not increment view count if recently viewed', async () => {
      configService.get.mockReturnValue(1); // 1 hour debounce
      cacheService.get.mockResolvedValue('1');

      await service.recordView('post-1', 'ip-hash');

      expect(cacheService.get).toHaveBeenCalledWith('blog_view:post-1:ip-hash');
      expect(prismaWrite.blogPost.update).not.toHaveBeenCalled();
      expect(cacheService.set).not.toHaveBeenCalled();
    });
  });
});
