import { Controller, Get, Param } from '@nestjs/common';
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
}
