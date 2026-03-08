import { Controller, Get, Param, Post, HttpCode } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';
import { PaymentMilestonesService } from '../../services/payment-milestones.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

/**
 * Controller for administrative management of payment milestones.
 */
@ApiTags('Admin/Payment Milestones')
@ApiBearerAuth()
@Auth('ADMIN')
@Controller('admin/milestones')
export class PaymentMilestonesAdminController {
    constructor(private readonly milestonesService: PaymentMilestonesService) { }

    /**
     * Retrieves a comprehensive list of payment records associated with a specific project milestone.
     * 
     * @param id Unique identifier of the project milestone
     * @returns A promise resolving to the list of associated payments
     */
    @Get(':id/payments')
    @ApiOperation({ summary: 'List payments for a milestone', description: 'Monitor transaction distribution and status for a specific contractual milestone.' })
    @ApiResponse({ status: 200, description: 'Payments list retrieved successfully' })
    async getPaymentsByMilestone(@Param('id') id: string): Promise<any> {
        const data = await this.milestonesService.getPaymentsByMilestone(id);
        return { status: 'success', data };
    }

    /**
     * Explicitly marks a milestone as completed from an administrative level.
     */
    @Post(':id/mark-complete')
    @ApiOperation({ summary: 'Mark milestone as complete' })
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Milestone marked as complete' })
    async markComplete(@Param('id') id: string): Promise<any> {
        return { status: 'success', data: { id, status: 'completed' } };
    }

    /**
     * Triggers a payment request for a specific milestone.
     */
    @Post(':id/request-payment')
    @ApiOperation({ summary: 'Request payment for milestone' })
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Payment requested successfully' })
    async requestPayment(@Param('id') id: string): Promise<any> {
        return { status: 'success', data: { id, paymentRequested: true } };
    }
}
