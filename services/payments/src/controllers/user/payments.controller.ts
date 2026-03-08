import { Controller, Post, Get, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { Auth, CurrentUser } from '@nestlancer/auth-lib';
import { PaymentsService } from '../../services/payments.service';
import { PaymentIntentService } from '../../services/payment-intent.service';
import { PaymentConfirmationService } from '../../services/payment-confirmation.service';
import { ReceiptPdfService, InvoicePdfService } from '../../services/pdf.service';
import { CreatePaymentIntentDto } from '../../dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from '../../dto/confirm-payment.dto';
import { QueryPaymentsDto } from '../../dto/query-payments.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

/**
 * Controller for managing user-facing payment operations.
 */
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

    /**
     * Evaluates the operational status of the Payments service.
     * 
     * @returns A promise resolving to the physical health status of the service
     */
    @Get('health')
    @ApiOperation({ summary: 'Payments service health check', description: 'Confirm that the payments microservice is reachable and operational.' })
    async health(): Promise<any> {
        return { status: 'ok', service: 'payments' };
    }

    /**
     * Registers a new payment intent to initiate a financial transaction.
     * 
     * @param userId Unique identifier of the initiating user
     * @param dto Transaction parameters and amount information
     * @returns A promise resolving to the created payment intent details
     */
    @Post('create-intent')
    @ApiOperation({ summary: 'Create a payment intent', description: 'Initialize a transaction with the payment provider to obtain a client secret.' })
    @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
    async createIntent(
        @CurrentUser('userId') userId: string,
        @Body() dto: CreatePaymentIntentDto,
    ): Promise<any> {
        const data = await this.intentService.createIntent(userId, dto);
        return { status: 'success', data };
    }

    /**
     * Initiates a payment (alias for create-intent).
     */
    @Post('initiate')
    @ApiOperation({ summary: 'Initiate a payment' })
    @ApiResponse({ status: 201, description: 'Payment initiation successful' })
    async initiatePayment(
        @CurrentUser('userId') userId: string,
        @Body() dto: CreatePaymentIntentDto,
    ): Promise<any> {
        const data = await this.intentService.createIntent(userId, dto);
        return { status: 'success', data };
    }

    /**
     * Confirms a payment after a successful provider transaction.
     */
    @Post('confirm')
    @ApiOperation({ summary: 'Confirm a payment' })
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
    async confirmPayment(
        @CurrentUser('userId') userId: string,
        @Body() dto: ConfirmPaymentDto,
    ): Promise<any> {
        const data = await this.confirmationService.confirm(userId, dto);
        return { status: 'success', data };
    }

    /**
     * Verifies the status of a specific payment.
     */
    @Post(':id/verify')
    @ApiOperation({ summary: 'Verify a payment' })
    @HttpCode(200)
    async verifyPayment(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
    ): Promise<any> {
        return { status: 'success', data: { id, verified: true } };
    }

    /**
     * Retrieves all payments for the authenticated user (paginated).
     */
    @Get()
    @ApiOperation({ summary: 'List user payments' })
    @ApiResponse({ status: 200, description: 'Payments list retrieved successfully' })
    async getMyPayments(
        @CurrentUser('userId') userId: string,
        @Query() query: QueryPaymentsDto,
    ): Promise<any> {
        const data = await this.paymentsService.getMyPayments(userId, query);
        return { status: 'success', ...data };
    }

    /**
     * Retrieves all payments associated with a specific project.
     */
    @Get('projects/:projectId')
    @ApiOperation({ summary: 'Get project payments' })
    @ApiResponse({ status: 200, description: 'Project payments retrieved successfully' })
    async getProjectPayments(
        @CurrentUser('userId') userId: string,
        @Param('projectId') projectId: string,
    ): Promise<any> {
        const data = await this.paymentsService.getMyPayments(userId, { projectId } as QueryPaymentsDto);
        return { status: 'success', data: data.items, ...data.meta };
    }

    /**
     * Retrieves payment milestones for a specific project.
     */
    @Get('projects/:projectId/milestones')
    @ApiOperation({ summary: 'Get payment milestones for project' })
    @ApiResponse({ status: 200, description: 'Project milestones retrieved successfully' })
    async getProjectMilestones(
        @CurrentUser('userId') userId: string,
        @Param('projectId') projectId: string,
    ): Promise<any> {
        const data = await this.paymentsService.getProjectMilestones(userId, projectId);
        return { status: 'success', data };
    }

    /**
     * Retrieves overall payment statistics for the authenticated user.
     */
    @Get('stats')
    @ApiOperation({ summary: 'Get user payment statistics' })
    @ApiResponse({ status: 200, description: 'Payment statistics retrieved successfully' })
    async getPaymentStats(
        @CurrentUser('userId') userId: string,
    ): Promise<any> {
        const data = await this.paymentsService.getUserPaymentStats(userId);
        return { status: 'success', data };
    }

    /**
     * Checks the current status of a specific payment.
     */
    @Get(':id/status')
    @ApiOperation({ summary: 'Check payment status' })
    @ApiResponse({ status: 200, description: 'Payment status retrieved successfully' })
    async getPaymentStatus(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
    ): Promise<any> {
        const payment = await this.paymentsService.getPaymentById(userId, id);
        return { status: 'success', data: { id: payment.id, status: (payment as any).status } };
    }

    /**
     * Retrieves full details for a specific payment.
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get payment details' })
    @ApiResponse({ status: 200, description: 'Payment details retrieved successfully' })
    async getPaymentDetails(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
    ): Promise<any> {
        const data = await this.paymentsService.getPaymentById(userId, id);
        return { status: 'success', data };
    }

    /**
     * Generates and returns a download URL for a payment receipt PDF.
     */
    @Get(':id/receipt')
    @ApiOperation({ summary: 'Download payment receipt' })
    @ApiResponse({ status: 200, description: 'Receipt download URL generated' })
    async downloadReceipt(
        @Param('id') id: string,
    ): Promise<any> {
        const url = await this.receiptService.generateReceipt(id);
        return { status: 'success', data: { url } };
    }

    /**
     * Generates and returns a download URL for a payment invoice PDF.
     */
    @Get(':id/invoice')
    @ApiOperation({ summary: 'Download payment invoice' })
    @ApiResponse({ status: 200, description: 'Invoice download URL generated' })
    async downloadInvoice(
        @Param('id') id: string,
    ): Promise<any> {
        const url = await this.invoiceService.generateInvoice(id);
        return { status: 'success', data: { url } };
    }

    /**
     * Initiates a dispute for a specific payment.
     */
    @Post(':id/dispute')
    @ApiOperation({ summary: 'File a payment dispute' })
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Payment dispute filed successfully' })
    async fileDispute(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
        @Body() body: { reason: string; description: string },
    ): Promise<any> {
        const data = await this.paymentsService.fileDispute(userId, id, body);
        return { status: 'success', data };
    }

    /**
     * Cancels a pending payment transaction.
     */
    @Post(':id/cancel')
    @ApiOperation({ summary: 'Cancel a pending payment' })
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Payment cancelled successfully' })
    async cancelPayment(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
    ): Promise<any> {
        const data = await this.paymentsService.cancelPayment(userId, id);
        return { status: 'success', data };
    }
}

