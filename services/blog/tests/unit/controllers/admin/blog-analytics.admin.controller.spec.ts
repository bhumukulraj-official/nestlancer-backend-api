import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from '@nestlancer/auth-lib';
import { BlogAnalyticsAdminController } from '../../../../src/controllers/admin/blog-analytics.admin.controller';

describe('BlogAnalyticsAdminController', () => {
  let controller: BlogAnalyticsAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogAnalyticsAdminController],
      providers: [
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
            getAllAndOverride: jest.fn(),
            getAllAndMerge: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<BlogAnalyticsAdminController>(BlogAnalyticsAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAnalytics', () => {
    it('should return mock analytics', () => {
      const result = controller.getAnalytics({});
      expect(result).toEqual({ totalViews: 0, totalLikes: 0, topPosts: [] });
    });
  });
});
