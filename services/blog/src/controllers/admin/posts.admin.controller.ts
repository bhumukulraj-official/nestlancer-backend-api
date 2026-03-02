import { UserRole } from '@nestlancer/common';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';
import { BlogAdminService } from '../../services/blog-admin.service';
import { PostsService } from '../../services/posts.service';
import { PostPublishingService } from '../../services/post-publishing.service';
import { PostSchedulingService } from '../../services/post-scheduling.service';
import { CreatePostDto } from '../../dto/create-post.dto';
import { UpdatePostDto } from '../../dto/update-post.dto';
import { SchedulePostDto } from '../../dto/schedule-post.dto';

@Controller('admin/posts')
@Auth(UserRole.ADMIN)
export class PostsAdminController {
    constructor(
        private readonly adminService: BlogAdminService,
        private readonly postsService: PostsService,
        private readonly publishingService: PostPublishingService,
        private readonly schedulingService: PostSchedulingService,
    ) { }

    @Get()
    findAll(@Query() query: any) {
        return this.adminService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.adminService.findById(id);
    }

    @Post()
    create(@Body() dto: CreatePostDto, @Req() req: any) {
        // Assuming authorId can be injected from user context if not provided
        if (!dto.authorId) {
            dto.authorId = req.user.id;
        }
        return this.postsService.create(dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
        return this.adminService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.adminService.softDelete(id);
    }

    @Post(':id/publish')
    publish(@Param('id') id: string) {
        return this.publishingService.publish(id);
    }

    @Post(':id/unpublish')
    unpublish(@Param('id') id: string) {
        return this.publishingService.unpublish(id);
    }

    @Post(':id/schedule')
    schedule(@Param('id') id: string, @Body() dto: SchedulePostDto) {
        return this.schedulingService.schedule(id, new Date(dto.scheduledAt));
    }
}
