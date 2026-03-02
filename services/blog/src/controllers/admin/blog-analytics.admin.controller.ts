import { UserRole } from '@nestlancer/common';
import { Controller, Get, Query } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';

@Controller('admin/blog/analytics')
@Auth(UserRole.ADMIN)
export class BlogAnalyticsAdminController {
    @Get()
    getAnalytics(@Query() query: any) {
        return { totalViews: 0, totalLikes: 0, topPosts: [] };
    }
}
