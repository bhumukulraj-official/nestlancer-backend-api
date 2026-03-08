import { Controller, Get, Param, Post } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';
import { PaymentMilestonesService } from '../../services/payment-milestones.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin Payment Milestones')
@ApiBearerAuth()
@Auth('ADMIN')
@Controller('admin/milestones')
export class PaymentMilestonesAdminController {
    constructor(private readonly milestonesService: PaymentMilestonesService) { }

    @Get(':id/payments')
    @ApiOperation({ summary: 'List payments for a milestone' })
    async getPaymentsByMilestone(@Param('id') id: string) {
        const data = await this.milestonesService.getPaymentsByMilestone(id);
        return { status: 'success', data };
    }

    @Post(':id/mark-complete')
    @ApiOperation({ summary: 'Mark milestone as complete' })
    async markComplete(@Param('id') id: string) {
        return { status: 'success', data: { id, status: 'completed' } };
    }

    @Post(':id/request-payment')
    @ApiOperation({ summary: 'Request payment for milestone' })
    async requestPayment(@Param('id') id: string) {
        return { status: 'success', data: { id, paymentRequested: true } };
    }
}
