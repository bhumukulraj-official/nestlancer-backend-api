import { Controller, Post, Get, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { Auth, CurrentUser } from '@nestlancer/auth-lib';
import { PaymentsService } from '../../services/payments.service';
import { PaymentIntentService } from '../../services/payment-intent.service';
import { PaymentConfirmationService } from '../../services/payment-confirmation.service';
import { ReceiptPdfService, InvoicePdfService } from '../../services/pdf.service';
import { CreatePaymentIntentDto } from '../../dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from '../../dto/confirm-payment.dto';
import { QueryPaymentsDto } from '../../dto/query-payments.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Payments')
@ApiBearerAuth()
@Auth()
@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly intentService: PaymentIntentService,
        private readonly confirmationService: PaymentConfirmationService,
        private readonly receiptService: ReceiptPdfService,
        private readonly invoiceService: InvoicePdfService,
    ) { }

    @Get('health')
    @ApiOperation({ summary: 'Payments service health check' })
    health() {
        return { status: 'ok', service: 'payments' };
    }

    @Post('create-intent')
    @ApiOperation({ summary: 'Create a payment intent' })
    async createIntent(
        @CurrentUser('userId') userId: string,
        @Body() dto: CreatePaymentIntentDto,
    ) {
        const data = await this.intentService.createIntent(userId, dto);
        return { status: 'success', data };
    }

    @Post('initiate')
    @ApiOperation({ summary: 'Initiate a payment' })
    async initiatePayment(
        @CurrentUser('userId') userId: string,
        @Body() dto: CreatePaymentIntentDto,
    ) {
        const data = await this.intentService.createIntent(userId, dto);
        return { status: 'success', data };
    }


    @Post('confirm')
    @ApiOperation({ summary: 'Confirm a payment' })
    async confirmPayment(
        @CurrentUser('userId') userId: string,
        @Body() dto: ConfirmPaymentDto,
    ) {
        const data = await this.confirmationService.confirm(userId, dto);
        return { status: 'success', data };
    }

    @Post(':id/verify')
    @ApiOperation({ summary: 'Verify a payment' })
    async verifyPayment(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
    ) {
        return { status: 'success', data: { id, verified: true } };
    }


    @Get()
    @ApiOperation({ summary: 'List user payments' })
    async getMyPayments(
        @CurrentUser('userId') userId: string,
        @Query() query: QueryPaymentsDto,
    ) {
        const data = await this.paymentsService.getMyPayments(userId, query);
        return { status: 'success', ...data };
    }

    @Get('projects/:projectId')
    @ApiOperation({ summary: 'Get project payments' })
    async getProjectPayments(
        @CurrentUser('userId') userId: string,
        @Param('projectId') projectId: string,
    ) {
        const data = await this.paymentsService.getMyPayments(userId, { projectId } as QueryPaymentsDto);
        return { status: 'success', data: data.items, ...data.meta };
    }

    @Get('projects/:projectId/milestones')
    @ApiOperation({ summary: 'Get payment milestones for project' })
    async getProjectMilestones(
        @CurrentUser('userId') userId: string,
        @Param('projectId') projectId: string,
    ) {
        const data = await this.paymentsService.getProjectMilestones(userId, projectId);
        return { status: 'success', data };
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get user payment statistics' })
    async getPaymentStats(
        @CurrentUser('userId') userId: string,
    ) {
        const data = await this.paymentsService.getUserPaymentStats(userId);
        return { status: 'success', data };
    }

    @Get(':id/status')
    @ApiOperation({ summary: 'Check payment status' })
    async getPaymentStatus(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
    ) {
        const payment = await this.paymentsService.getPaymentById(userId, id);
        return { status: 'success', data: { id: payment.id, status: (payment as any).status } };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get payment details' })
    async getPaymentDetails(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
    ) {
        const data = await this.paymentsService.getPaymentById(userId, id);
        return { status: 'success', data };
    }

    @Get(':id/receipt')
    @ApiOperation({ summary: 'Download payment receipt' })
    async downloadReceipt(
        @Param('id') id: string,
    ): Promise<any> {
        const url = await this.receiptService.generateReceipt(id);
        return { status: 'success', data: { url } };
    }

    @Get(':id/invoice')
    @ApiOperation({ summary: 'Download payment invoice' })
    async downloadInvoice(
        @Param('id') id: string,
    ): Promise<any> {
        const url = await this.invoiceService.generateInvoice(id);
        return { status: 'success', data: { url } };
    }

    @Post(':id/dispute')
    @ApiOperation({ summary: 'File a payment dispute' })
    async fileDispute(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
        @Body() body: { reason: string; description: string },
    ) {
        const data = await this.paymentsService.fileDispute(userId, id, body);
        return { status: 'success', data };
    }

    @Post(':id/cancel')
    @ApiOperation({ summary: 'Cancel a pending payment' })
    async cancelPayment(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
    ) {
        const data = await this.paymentsService.cancelPayment(userId, id);
        return { status: 'success', data };
    }
}

