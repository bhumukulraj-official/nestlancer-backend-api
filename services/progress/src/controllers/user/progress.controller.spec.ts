import { Test, TestingModule } from '@nestjs/testing';
import { ProgressController } from './progress.controller';
import { ProgressTimelineService } from '../../services/progress-timeline.service';
import { ProgressService } from '../../services/progress.service';

describe('ProgressController', () => {
  let controller: ProgressController;

  const mockTimelineService = {
    getTimeline: jest.fn(),
  };

  const mockProgressService = {
    getStatusSummary: jest.fn(),
    getEntryById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressController],
      providers: [
        { provide: ProgressTimelineService, useValue: mockTimelineService },
        { provide: ProgressService, useValue: mockProgressService },
      ],
    }).compile();

    controller = module.get<ProgressController>(ProgressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTimeline', () => {
    it('should return the project timeline', async () => {
      mockTimelineService.getTimeline.mockResolvedValue({
        items: [],
        meta: { total: 0, page: 1, limit: 20 },
      });
      const result = await controller.getTimeline('p1', {});
      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('items');
    });
  });

  describe('getStatusSummary', () => {
    it('should return project status summary', async () => {
      mockProgressService.getStatusSummary.mockResolvedValue({
        percentageComplete: 50,
        currentPhase: 'Phase 1',
      });
      const result = await controller.getStatusSummary('p1');
      expect(result).toHaveProperty('status', 'success');
      expect(result.data.percentageComplete).toBe(50);
    });
  });
});
