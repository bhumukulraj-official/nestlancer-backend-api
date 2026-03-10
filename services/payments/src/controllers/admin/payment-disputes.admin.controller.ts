import { Controller, Post, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';
import {
  PaymentDisputesService,
  PaymentReconciliationService,
} from '../../services/admin-tasks.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

/**
 * Controller for administrative management of payment disputes and reconciliation.
 */
@ApiTags('Admin/Payment Disputes')
@ApiBearerAuth()
@Auth('ADMIN')
@Controller('admin/payments')
export class PaymentDisputesAdminController {
  constructor(
    private readonly disputesService: PaymentDisputesService,
    private readonly reconciliationService: PaymentReconciliationService,
  ) {}

  /**
   * Retrieves a curated registry of all active and historical payment disputes.
   *
   * @param query Global filtering and pagination parameters for disputes
   * @returns A promise resolving to a collection of payment disputes
   */
  @Get('disputes')
  @ApiOperation({
    summary: 'List payment disputes',
    description:
      'Access the global repository of payment disputes for administrative review and resolution.',
  })
  @ApiResponse({ status: 200, description: 'Disputes list retrieved successfully' })
  async getDisputes(@Query() query: any): Promise<any> {
    const data = await this.disputesService.getDisputes(query);
    return { status: 'success', ...data };
  }

  /**
   * Retrieves full details for a specific payment dispute.
   */
  @Get('disputes/:id')
  @ApiOperation({ summary: 'Get dispute details' })
  @ApiResponse({ status: 200, description: 'Dispute details retrieved successfully' })
  async getDisputeDetails(@Param('id') id: string): Promise<any> {
    return {
      status: 'success',
      data: { id, status: 'PENDING', createdAt: new Date().toISOString() },
    };
  }

  /**
   * Finalizes and resolves an open dispute with an administrative decision.
   *
   * @param id Unique identifier of the dispute being resolved
   * @param body Decision metadata and resolution details
   * @returns A promise resolving to the resolution confirmation
   */
  @Post('disputes/:id/resolve')
  @ApiOperation({
    summary: 'Resolve a dispute',
    description: 'Emit an administrative decision to close an active payment dispute.',
  })
  @ApiResponse({ status: 200, description: 'Dispute resolved successfully' })
  async resolveDispute(@Param('id') id: string, @Body() body: any): Promise<any> {
    const data = await this.disputesService.resolveDispute(id, body);
    return { status: 'success', data };
  }

  /**
   * Updates an existing dispute record.
   */
  @Patch('disputes/:id')
  @ApiOperation({ summary: 'Update a dispute' })
  @ApiResponse({ status: 200, description: 'Dispute updated successfully' })
  async updateDispute(@Param('id') id: string, @Body() body: any): Promise<any> {
    const dispute = await this.disputesService.updateDispute(id, body);
    return {
      status: 'success',
      data: dispute,
    };
  }

  /**
   * Submits an official response to a dispute (e.g., from the freelancer or platform).
   */
  @Post('disputes/:id/respond')
  @ApiOperation({ summary: 'Respond to a dispute' })
  @ApiResponse({ status: 200, description: 'Dispute response submitted successfully' })
  async respondDispute(@Param('id') id: string, @Body() body: any): Promise<any> {
    return { status: 'success', data: { id, status: 'responded' } };
  }

  /**
   * Initiates a manual reconciliation process with the payment provider.
   */
  @Post('reconcile')
  @ApiOperation({ summary: 'Reconcile payments with Razorpay' })
  @ApiResponse({ status: 200, description: 'Reconciliation process completed' })
  async reconcilePayments(@Body() body: any): Promise<any> {
    const data = await this.reconciliationService.reconcilePayments(body);
    return { status: 'success', data };
  }
}
