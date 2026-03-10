import { Test, TestingModule } from '@nestjs/testing';
import { ProgressController } from '../../../../src/controllers/user/progress.controller';
import { ProgressTimelineService } from '../../../../src/services/progress-timeline.service';
import { ProgressService } from '../../../../src/services/progress.service';

describe('ProgressController', () => {
  let controller: ProgressController;

  const mockTimelineService = {};
  const mockProgressService = {};

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
});
