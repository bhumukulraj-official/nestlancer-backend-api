import { Test, TestingModule } from '@nestjs/testing';
import { BlogAnalyticsAdminController } from '../../../../src/controllers/admin/blog-analytics.admin.controller';

describe('BlogAnalyticsAdminController', () => {
    let controller: BlogAnalyticsAdminController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BlogAnalyticsAdminController],
        }).compile();

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
