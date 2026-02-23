import { Controller, Post, Body, Param } from '@nestjs/common';
import { Auth, CurrentUser } from '@nestlancer/auth-lib';
import { MilestoneApprovalService } from '../../services/milestone-approval.service';
import { ApproveMilestoneDto } from '../../dto/approve-milestone.dto';
import { RequestMilestoneRevisionDto } from '../../dto/request-milestone-revision.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Milestone Approvals')
@ApiBearerAuth()
@Auth()
@Controller('milestones')
export class MilestoneApprovalsController {
    constructor(private readonly approvalService: MilestoneApprovalService) { }

    @Post(':id/approve')
    @ApiOperation({ summary: 'Approve a milestone' })
    async approveMilestone(
        @Param('id') id: string,
        @CurrentUser('userId') userId: string,
        @Body() dto: ApproveMilestoneDto,
    ) {
        const data = await this.approvalService.approve(id, userId, dto);
        return { status: 'success', data };
    }

    @Post(':id/request-revision')
    @ApiOperation({ summary: 'Request revision on a milestone' })
    async requestRevision(
        @Param('id') id: string,
        @CurrentUser('userId') userId: string,
        @Body() dto: RequestMilestoneRevisionDto,
    ) {
        const data = await this.approvalService.requestRevision(id, userId, dto);
        return { status: 'success', data };
    }
}
