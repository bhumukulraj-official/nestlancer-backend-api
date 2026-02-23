import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';
import { PaymentsService } from '../../services/payments.service';
import { RefundService } from '../../services/refund.service';
import { PaymentStatsService } from '../../services/admin-tasks.service';
import { ProcessRefundDto } from '../../dto/process-refund.dto';
import { QueryPaymentsDto } from '../../dto/query-payments.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '@nestlancer/auth-lib';

@ApiTags('Admin Payments')
@ApiBearerAuth()
@Auth('ADMIN')
@Controller('admin/payments')
export class PaymentsAdminController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly refundService: RefundService,
        private readonly statsService: PaymentStatsService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'List all payments' })
    async getPayments(@Query() query: QueryPaymentsDto) {
        const data = await this.paymentsService.getAdminPayments(query);
        return { status: 'success', ...data };
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get payment statistics' })
    async getStats() {
        const data = await this.statsService.getStats();
        return { status: 'success', data };
    }

    @Post(':id/refund')
    @ApiOperation({ summary: 'Process a refund' })
    async processRefund(
        @Param('id') id: string,
        @CurrentUser('userId') adminId: string,
        @Body() dto: ProcessRefundDto,
    ) {
        const data = await this.refundService.processRefund(id, adminId, dto);
        return { status: 'success', data };
    }
}
