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

    @Post('intents')
    @ApiOperation({ summary: 'Create a payment intent' })
    async createIntent(
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

    @Get()
    @ApiOperation({ summary: 'List user payments' })
    async getMyPayments(
        @CurrentUser('userId') userId: string,
        @Query() query: QueryPaymentsDto,
    ) {
        const data = await this.paymentsService.getMyPayments(userId, query);
        return { status: 'success', ...data };
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
    ) {
        const url = await this.receiptService.generateReceipt(id);
        return { status: 'success', data: { url } };
    }

    @Get(':id/invoice')
    @ApiOperation({ summary: 'Download payment invoice' })
    async downloadInvoice(
        @Param('id') id: string,
    ) {
        const url = await this.invoiceService.generateInvoice(id);
        return { status: 'success', data: { url } };
    }
}
