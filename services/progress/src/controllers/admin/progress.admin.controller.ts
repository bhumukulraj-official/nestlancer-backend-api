import { Controller, Post, Get, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { Auth, CurrentUser } from '@nestlancer/auth-lib';
import { ProgressService } from '../../services/progress.service';
import { CreateProgressEntryDto } from '../../dto/create-progress-entry.dto';
import { UpdateProgressEntryDto } from '../../dto/update-progress-entry.dto';
import { QueryProgressDto } from '../../dto/query-progress.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin Progress')
@ApiBearerAuth()
@Auth('ADMIN')
@Controller('admin/progress')
export class ProgressAdminController {
    constructor(private readonly progressService: ProgressService) { }

    @Post('projects/:projectId')
    @ApiOperation({ summary: 'Create progress entry' })
    async createProgressEntry(
        @Param('projectId') projectId: string,
        @CurrentUser('userId') adminId: string,
        @Body() dto: CreateProgressEntryDto,
    ) {
        const entry = await this.progressService.createEntry(adminId, projectId, dto);
        return { status: 'success', data: entry };
    }

    @Get('projects/:projectId')
    @ApiOperation({ summary: 'List progress entries for project' })
    async getProjectProgress(
        @Param('projectId') projectId: string,
        @Query() query: QueryProgressDto,
    ) {
        const data = await this.progressService.getProjectProgress(projectId, query);
        return { status: 'success', ...data };
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update progress entry' })
    async updateProgressEntry(
        @Param('id') id: string,
        @Body() dto: UpdateProgressEntryDto,
    ) {
        const data = await this.progressService.updateEntry(id, dto);
        return { status: 'success', data };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete progress entry' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteProgressEntry(@Param('id') id: string) {
        await this.progressService.deleteEntry(id);
        return { status: 'success' };
    }

    @Get('projects/:projectId/analytics')
    @ApiOperation({ summary: 'Get progress analytics for project' })
    async getAnalytics(@Param('projectId') projectId: string) {
        // TODO: Admin analytics for progress
        return { status: 'success', projectId, analytics: {} };
    }

    @Get('projects/:projectId/timeline')
    @ApiOperation({ summary: 'Get full administrative timeline for project' })
    async getAdminTimeline(@Param('projectId') projectId: string) {
        // TODO: Admin full timeline view
        return { status: 'success', projectId, timeline: [] };
    }

    @Patch('projects/:projectId/status')
    @ApiOperation({ summary: 'Update project status (admin)' })
    async updateProjectStatus(
        @Param('projectId') projectId: string,
        @Body() body: any,
    ) {
        return { status: 'success', data: { projectId, newStatus: body.status } };
    }

    @Post('projects/:projectId/complete')
    @ApiOperation({ summary: 'Mark project as complete (admin)' })
    async markProjectComplete(
        @Param('projectId') projectId: string,
        @Body() body: any,
    ) {
        return { status: 'success', data: { projectId, status: 'COMPLETED', completedAt: new Date().toISOString() } };
    }
}
