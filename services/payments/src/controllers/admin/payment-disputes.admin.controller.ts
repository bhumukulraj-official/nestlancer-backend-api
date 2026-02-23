import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';
import { PaymentDisputesService, PaymentReconciliationService } from '../../services/admin-tasks.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin Payment Disputes')
@ApiBearerAuth()
@Auth('ADMIN')
@Controller('admin/payments')
export class PaymentDisputesAdminController {
    constructor(
        private readonly disputesService: PaymentDisputesService,
        private readonly reconciliationService: PaymentReconciliationService,
    ) { }

    @Get('disputes')
    @ApiOperation({ summary: 'List payment disputes' })
    async getDisputes(@Query() query: any) {
        const data = await this.disputesService.getDisputes(query);
        return { status: 'success', ...data };
    }

    @Post('disputes/:id/resolve')
    @ApiOperation({ summary: 'Resolve a dispute' })
    async resolveDispute(@Param('id') id: string, @Body() body: any) {
        const data = await this.disputesService.resolveDispute(id, body);
        return { status: 'success', data };
    }

    @Post('reconcile')
    @ApiOperation({ summary: 'Reconcile payments with Razorpay' })
    async reconcilePayments(@Body() body: any) {
        const data = await this.reconciliationService.reconcilePayments(body);
        return { status: 'success', data };
    }
}
