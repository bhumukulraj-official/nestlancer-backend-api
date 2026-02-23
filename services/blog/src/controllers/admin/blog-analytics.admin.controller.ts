import { Controller, Get, Query } from '@nestjs/common';
import { Auth, UserRole } from '@nestlancer/auth-lib';

@Controller('admin/blog/analytics')
@Auth(UserRole.ADMIN)
export class BlogAnalyticsAdminController {
    @Get()
    getAnalytics(@Query() query: any) {
        return { totalViews: 0, totalLikes: 0, topPosts: [] };
    }
}
