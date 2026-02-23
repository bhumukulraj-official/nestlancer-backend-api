import { Controller, Post, Patch, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';
import { MilestonesService } from '../../services/milestones.service';
import { CreateMilestoneDto } from '../../dto/create-milestone.dto';
import { UpdateMilestoneDto } from '../../dto/update-milestone.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin Milestones')
@ApiBearerAuth()
@Auth('ADMIN')
@Controller('admin')
export class MilestonesAdminController {
    constructor(private readonly milestonesService: MilestonesService) { }

    @Post('projects/:projectId/milestones')
    @ApiOperation({ summary: 'Create milestone' })
    async createMilestone(
        @Param('projectId') projectId: string,
        @Body() dto: CreateMilestoneDto,
    ) {
        const data = await this.milestonesService.create(projectId, dto);
        return { status: 'success', data };
    }

    @Patch('milestones/:id')
    @ApiOperation({ summary: 'Update milestone' })
    async updateMilestone(
        @Param('id') id: string,
        @Body() dto: UpdateMilestoneDto,
    ) {
        const data = await this.milestonesService.update(id, dto);
        return { status: 'success', data };
    }

    @Post('milestones/:id/complete')
    @ApiOperation({ summary: 'Mark milestone complete' })
    async completeMilestone(@Param('id') id: string) {
        const data = await this.milestonesService.complete(id);
        return { status: 'success', data };
    }
}
