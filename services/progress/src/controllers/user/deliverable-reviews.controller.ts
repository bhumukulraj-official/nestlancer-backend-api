import { Controller, Post, Body, Param } from '@nestjs/common';
import { Auth, CurrentUser } from '@nestlancer/auth-lib';
import { DeliverableReviewService } from '../../services/deliverable-review.service';
import { ApproveDeliverableDto } from '../../dto/approve-deliverable.dto';
import { RejectDeliverableDto } from '../../dto/reject-deliverable.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Deliverable Reviews')
@ApiBearerAuth()
@Auth()
@Controller('deliverables')
export class DeliverableReviewsController {
    constructor(private readonly reviewService: DeliverableReviewService) { }

    @Post(':id/approve')
    @ApiOperation({ summary: 'Approve a deliverable' })
    async approveDeliverable(
        @Param('id') id: string,
        @CurrentUser('userId') userId: string,
        @Body() dto: ApproveDeliverableDto,
    ) {
        const data = await this.reviewService.approve(id, userId, dto);
        return { status: 'success', data };
    }

    @Post(':id/reject')
    @ApiOperation({ summary: 'Reject a deliverable' })
    async rejectDeliverable(
        @Param('id') id: string,
        @CurrentUser('userId') userId: string,
        @Body() dto: RejectDeliverableDto,
    ) {
        const data = await this.reviewService.reject(id, userId, dto);
        return { status: 'success', data };
    }
}
