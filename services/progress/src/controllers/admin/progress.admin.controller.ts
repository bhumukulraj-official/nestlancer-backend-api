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
}
