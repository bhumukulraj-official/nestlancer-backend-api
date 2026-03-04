import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsService } from '../../../src/services/announcements.service';

describe('AnnouncementsService', () => {
  let provider: AnnouncementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementsService,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<AnnouncementsService>(AnnouncementsService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
