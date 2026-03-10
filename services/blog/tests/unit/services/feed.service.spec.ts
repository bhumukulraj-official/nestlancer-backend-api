import { Test, TestingModule } from '@nestjs/testing';
import { FeedService } from '../../../src/services/feed.service';

describe('FeedService', () => {
  let service: FeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedService],
    }).compile();

    service = module.get<FeedService>(FeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateRss', () => {
    it('should generate RSS feed', async () => {
      const result = await service.generateRss();
      expect(result).toBe('<rss></rss>');
    });
  });

  describe('generateAtom', () => {
    it('should generate Atom feed', async () => {
      const result = await service.generateAtom();
      expect(result).toBe('<feed></feed>');
    });
  });
});
