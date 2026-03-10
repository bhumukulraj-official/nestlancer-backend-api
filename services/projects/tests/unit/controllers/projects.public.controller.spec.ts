import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsPublicController } from '../../../src/controllers/projects.public.controller';
import { PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException } from '@nestlancer/common';

describe('ProjectsPublicController', () => {
  let controller: ProjectsPublicController;
  let prismaRead: jest.Mocked<PrismaReadService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsPublicController],
      providers: [
        {
          provide: PrismaReadService,
          useValue: {
            // Add mock methods if needed later
          },
        },
      ],
    }).compile();

    controller = module.get<ProjectsPublicController>(ProjectsPublicController);
    prismaRead = module.get(PrismaReadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listPublicProjects', () => {
    it('should return empty portfolio projects', async () => {
      const result = await controller.listPublicProjects();
      expect(result).toEqual({ data: [], pagination: { total: 0 } });
    });
  });

  describe('getPublicProjectDetails', () => {
    it('should throw BusinessLogicException', async () => {
      await expect(controller.getPublicProjectDetails('p1')).rejects.toThrow(
        BusinessLogicException,
      );
      await expect(controller.getPublicProjectDetails('p1')).rejects.toThrow(
        'Project not public or not found',
      );
    });
  });
});
