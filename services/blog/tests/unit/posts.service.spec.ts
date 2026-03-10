import { PostsService } from '../../src/services/posts.service';

describe('PostsService', () => {
  let service: PostsService;
  let mockPrismaWrite: any;
  let mockPrismaRead: any;
  let mockConfigService: any;

  const mockPost = {
    id: 'post-1',
    title: 'Test Post',
    slug: 'test-post',
    status: 'PUBLISHED',
    publishedAt: new Date(),
    category: { name: 'Tech' },
    tags: [],
  };

  beforeEach(() => {
    mockPrismaRead = {
      blogPost: {
        findMany: jest.fn().mockResolvedValue([mockPost]),
        count: jest.fn().mockResolvedValue(1),
        findUnique: jest.fn().mockResolvedValue(mockPost),
      },
    };
    mockPrismaWrite = {
      blogPost: {
        create: jest.fn().mockResolvedValue({ ...mockPost, id: 'post-new', status: 'DRAFT' }),
      },
    };
    mockConfigService = { get: jest.fn().mockReturnValue(200) };
    service = new PostsService(mockPrismaWrite, mockPrismaRead, mockConfigService);
  });

  describe('create', () => {
    it('should create post with reading time', async () => {
      const result = await service.create({
        title: 'Test',
        content: 'Hello world this is a test post',
        categoryId: 'cat-1',
      } as any);
      expect(result.id).toBe('post-new');
    });
  });

  describe('findPublished', () => {
    it('should return published posts', async () => {
      const result = await service.findPublished({ page: 1, limit: 10 } as any);
      expect(result.items).toHaveLength(1);
      expect(result.totalItems).toBe(1);
    });
  });

  describe('findBySlug', () => {
    it('should find post by slug', async () => {
      const result = await service.findBySlug('test-post');
      expect(result.slug).toBe('test-post');
    });

    it('should throw for non-existent slug', async () => {
      mockPrismaRead.blogPost.findUnique.mockResolvedValue(null);
      await expect(service.findBySlug('invalid')).rejects.toThrow();
    });
  });
});
