import { Controller, Get, Param, Query } from '@nestjs/common';
import { Auth, CurrentUser } from '@nestlancer/auth-lib';
import { ProgressTimelineService } from '../../services/progress-timeline.service';
import { ProgressService } from '../../services/progress.service';
import { QueryProgressDto } from '../../dto/query-progress.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Progress')
@ApiBearerAuth()
@Auth()
@Controller('projects/:projectId/progress')
export class ProgressController {
    constructor(
        private readonly timelineService: ProgressTimelineService,
        private readonly progressService: ProgressService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get progress timeline for project' })
    async getTimeline(
        @Param('projectId') projectId: string,
        @Query() query: QueryProgressDto,
    ) {
        const data = await this.timelineService.getTimeline(projectId, query);
        return { status: 'success', ...data };
    }

    @Get('status')
    @ApiOperation({ summary: 'Get overall project status summary' })
    async getStatusSummary(@Param('projectId') projectId: string) {
        const data = await this.progressService.getStatusSummary(projectId);
        return { status: 'success', data };
    }

    @Get(':entryId')
    @ApiOperation({ summary: 'Get single progress entry' })
    async getEntry(@Param('entryId') entryId: string) {
        const data = await this.progressService.getEntryById(entryId);
        return { status: 'success', data };
    }
}
