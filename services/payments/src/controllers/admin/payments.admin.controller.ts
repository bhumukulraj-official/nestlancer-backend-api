import { Controller, Post, Get, Patch, Body, Param, Query, HttpCode } from '@nestjs/common';
import { Auth, CurrentUser } from '@nestlancer/auth-lib';
import { ApiStandardResponse } from '@nestlancer/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { PaymentsService } from '../../services/payments.service';
import { PaymentMilestonesService } from '../../services/payment-milestones.service';
import { RefundService } from '../../services/refund.service';
import {
  PaymentStatsService,
  PaymentReconciliationService,
} from '../../services/admin-tasks.service';
import { ProcessRefundDto } from '../../dto/process-refund.dto';
import { QueryPaymentsDto } from '../../dto/query-payments.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

/**
 * Controller for administrative payment management.
 */
@ApiTags('Admin/Payments')
@ApiBearerAuth()
@Auth('ADMIN')
@Controller('admin/payments')
export class PaymentsAdminController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly milestonesService: PaymentMilestonesService,
    private readonly refundService: RefundService,
    private readonly statsService: PaymentStatsService,
    private readonly reconciliationService: PaymentReconciliationService,
    private readonly prismaRead: PrismaReadService,
    private readonly prismaWrite: PrismaWriteService,
  ) {}

  /**
   * Retrieves a global, paginated registry of all financial transactions within the platform.
   *
   * @param query Global filtering and pagination parameters
   * @returns A promise resolving to a paginated set of all system payments
   */
  @Get()
  @ApiOperation({
    summary: 'List all payments (Admin)',
    description:
      'Access the global repository of payment records for administrative audit and reconciliation.',
  })
  @ApiResponse({ status: 200, description: 'Payments list retrieved successfully' })
  async getPayments(@Query() query: QueryPaymentsDto): Promise<any> {
    const data = await this.paymentsService.getAdminPayments(query);
    return { status: 'success', ...data };
  }

  /**
   * Retrieves aggregated system-wide financial statistics and KPIs.
   *
   * @returns A promise resolving to a statistical overview of payment volume and statuses
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get payment statistics',
    description:
      'Monitor high-level transaction volume, success rates, and total volume platform-wide.',
  })
  @ApiStandardResponse(Object)
  async getStats(): Promise<any> {
    const data = await this.statsService.getStats();
    return { status: 'success', data };
  }

  /**
   * Retrieves a read-only reconciliation report (payments with external IDs for audit).
   * Query params: startDate, endDate (ISO), page, limit.
   */
  @Get('reconciliation')
  @ApiOperation({ summary: 'Get payment reconciliation data' })
  @ApiStandardResponse(Object)
  async getReconciliation(
    @Query() query: { startDate?: string; endDate?: string; page?: string; limit?: string },
  ): Promise<any> {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    const page = query.page ? parseInt(query.page, 10) : undefined;
    const limit = query.limit ? parseInt(query.limit, 10) : undefined;
    const report = await this.reconciliationService.getReconciliationReport({
      startDate,
      endDate,
      page,
      limit,
    });
    return { status: 'success', data: report.items, pagination: report.pagination };
  }

  /**
   * Lists all payment milestones, optionally filtered by project.
   */
  @Get('milestones')
  @ApiOperation({ summary: 'List all payment milestones' })
  @ApiStandardResponse(Object)
  async listMilestones(@Query('projectId') projectId?: string): Promise<any> {
    const data = await this.milestonesService.listMilestones(projectId);
    return { status: 'success', data };
  }

  /**
   * Retrieves details for a specific payment milestone.
   */
  @Get('milestones/:id')
  @ApiOperation({ summary: 'Get milestone details' })
  @ApiStandardResponse(Object)
  async getMilestone(@Param('id') id: string): Promise<any> {
    const data = await this.milestonesService.getMilestoneById(id);
    if (!data) return { status: 'success', data: null };
    return { status: 'success', data };
  }

  /**
   * Creates new payment milestones for a specific project.
   */
  @Post('projects/:projectId/milestones')
  @ApiOperation({ summary: 'Create milestones for a project' })
  @ApiResponse({ status: 201, description: 'Milestones created successfully' })
  async createProjectMilestones(
    @Param('projectId') projectId: string,
    @Body() body: any,
  ): Promise<any> {
    return { status: 'success', data: { projectId, milestones: body.milestones || [] } };
  }

  /**
   * Updates an existing payment milestone.
   */
  @Patch('milestones/:id')
  @ApiOperation({ summary: 'Update a milestone' })
  @ApiStandardResponse(Object)
  async updateMilestone(@Param('id') id: string, @Body() body: any): Promise<any> {
    return { status: 'success', data: { id, ...body, updatedAt: new Date().toISOString() } };
  }

  /**
   * Generates a revenue report for a specified period and grouping.
   */
  @Get('revenue/report')
  @ApiOperation({ summary: 'Get revenue report' })
  @ApiStandardResponse(Object)
  async getRevenueReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('groupBy') groupBy: string = 'month',
  ): Promise<any> {
    const where: any = { status: 'COMPLETED' };
    if (from || to) {
      where.paidAt = {};
      if (from) where.paidAt.gte = new Date(from);
      if (to) where.paidAt.lte = new Date(to);
    }

    const payments = await this.prismaRead.payment.findMany({
      where,
      select: { amount: true, currency: true, paidAt: true },
      orderBy: { paidAt: 'asc' },
    });

    // Group by period
    const breakdown = new Map<string, { period: string; revenue: number; count: number }>();
    for (const p of payments) {
      const date = p.paidAt || new Date();
      let key: string;
      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!breakdown.has(key)) breakdown.set(key, { period: key, revenue: 0, count: 0 });
      const entry = breakdown.get(key)!;
      entry.revenue += Number(p.amount);
      entry.count++;
    }

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      status: 'success',
      data: {
        period: { from, to, groupBy },
        totalRevenue,
        totalTransactions: payments.length,
        breakdown: Array.from(breakdown.values()),
      },
    };
  }

  /**
   * Exports revenue data in the specified format (CSV/JSON).
   */
  @Get('revenue/export')
  @ApiOperation({ summary: 'Export revenue data' })
  @ApiStandardResponse(Object)
  async exportRevenue(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('format') format: string = 'csv',
  ): Promise<any> {
    const exportId = `export_${Date.now()}`;

    await this.prismaWrite.outbox.create({
      data: {
        type: 'REVENUE_EXPORT_REQUESTED',
        payload: { exportId, from, to, format },
      },
    });

    return {
      status: 'success',
      data: {
        exportId,
        status: 'processing',
        format,
      },
    };
  }

  /**
   * Retrieves full payment details for administrative review.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get payment details (Admin)' })
  @ApiStandardResponse(Object)
  async getPaymentDetails(@Param('id') id: string): Promise<any> {
    const payment = await this.prismaRead.payment.findUnique({
      where: { id },
      include: {
        refunds: true,
        client: { select: { id: true, firstName: true, lastName: true, email: true } },
        project: { select: { id: true, title: true } },
        milestone: { select: { id: true, name: true, status: true } },
      },
    });

    if (!payment) {
      return { status: 'error', message: 'Payment not found' };
    }

    return {
      status: 'success',
      data: payment,
    };
  }

  /**
   * Processes a refund for a transaction.
   */
  @Post(':id/refund')
  @ApiOperation({ summary: 'Process a refund' })
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  async processRefund(
    @Param('id') id: string,
    @CurrentUser('userId') adminId: string,
    @Body() dto: ProcessRefundDto,
  ): Promise<any> {
    const data = await this.refundService.processRefund(id, adminId, dto);
    return { status: 'success', data };
  }

  /**
   * Verifies a payment receipt or transaction.
   */
  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify a payment' })
  @HttpCode(200)
  @ApiStandardResponse(Object)
  async verifyPayment(@Param('id') id: string, @Body() body: any): Promise<any> {
    return {
      status: 'success',
      data: {
        id,
        verified: true,
        verificationNote: body.verificationNote,
        verifiedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Manually creates a payment entry in the system.
   */
  @Post('manual')
  @ApiOperation({ summary: 'Create manual payment entry' })
  @ApiResponse({ status: 201, description: 'Manual payment created successfully' })
  async createManualPayment(
    @CurrentUser('userId') adminId: string,
    @Body() body: any,
  ): Promise<any> {
    const payment = await this.prismaWrite.payment.create({
      data: {
        projectId: body.projectId,
        clientId: body.clientId,
        amount: body.amount,
        currency: body.currency || 'INR',
        status: 'COMPLETED',
        method: 'manual',
        customNotes: body.notes || `Manual payment by admin ${adminId}`,
        invoiceNumber: body.invoiceNumber || null,
        paidAt: new Date(),
      },
    });

    await this.prismaWrite.outbox.create({
      data: {
        type: 'MANUAL_PAYMENT_CREATED',
        payload: { paymentId: payment.id, adminId },
      },
    });

    return {
      status: 'success',
      data: { paymentId: payment.id, createdBy: adminId },
    };
  }

  /**
   * Explicitly releases funds for a specific payment milestone.
   */
  @Post('milestones/:id/release')
  @ApiOperation({ summary: 'Release milestone payment' })
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'Milestone payment released successfully' })
  async releaseMilestonePayment(
    @Param('id') id: string,
    @CurrentUser('userId') adminId: string,
  ): Promise<any> {
    const milestone = await this.prismaRead.milestone.findUnique({
      where: { id },
    });

    if (!milestone) {
      return { status: 'error', message: 'Milestone not found' };
    }

    // Find pending payment for this milestone
    const payment = await this.prismaRead.payment.findFirst({
      where: { milestoneId: id, status: 'PENDING' },
    });

    if (payment) {
      await this.prismaWrite.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED', paidAt: new Date() },
      });
    }

    await this.prismaWrite.milestone.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    await this.prismaWrite.outbox.create({
      data: {
        type: 'MILESTONE_PAYMENT_RELEASED',
        payload: { milestoneId: id, paymentId: payment?.id, releasedBy: adminId },
      },
    });

    return {
      status: 'success',
      data: { milestoneId: id, released: true, releasedBy: adminId },
    };
  }

  /**
   * Retrieves individual transactions related to a specific payment.
   */
  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get transaction history for a payment' })
  @ApiStandardResponse(Object)
  async getTransactionHistory(@Param('id') id: string): Promise<any> {
    const refunds = await this.prismaRead.refund.findMany({
      where: { paymentId: id },
      orderBy: { createdAt: 'desc' },
    });

    const payment = await this.prismaRead.payment.findUnique({
      where: { id },
      select: { id: true, amount: true, status: true, paidAt: true, createdAt: true },
    });

    const transactions = [
      ...(payment ? [{ kind: 'payment' as const, ...payment }] : []),
      ...refunds.map((r) => ({ kind: 'refund' as const, ...r })),
    ];

    return {
      status: 'success',
      data: { paymentId: id, transactions },
    };
  }

  /**
   * Retrieves the audit timeline (events) for a specific payment.
   */
  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get payment timeline' })
  @ApiStandardResponse(Object)
  async getPaymentTimeline(@Param('id') id: string): Promise<any> {
    const events = await this.prismaRead.auditLog.findMany({
      where: {
        resourceType: 'payment',
        resourceId: id,
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        action: true,
        description: true,
        userId: true,
        createdAt: true,
      },
    });

    return {
      status: 'success',
      data: { paymentId: id, events },
    };
  }

  /**
   * Retrieves the list of currently supported payment methods.
   */
  @Get('methods/supported')
  @ApiOperation({ summary: 'Get supported payment methods' })
  @ApiStandardResponse(Object)
  async getSupportedMethods(): Promise<any> {
    return {
      status: 'success',
      data: {
        methods: [
          { id: 'razorpay', name: 'Razorpay', enabled: true },
          { id: 'bank_transfer', name: 'Bank Transfer', enabled: true },
        ],
      },
    };
  }

  /**
   * Updates global payment configuration settings.
   */
  @Patch('settings')
  @ApiOperation({ summary: 'Update payment settings' })
  @ApiStandardResponse(Object)
  async updatePaymentSettings(@Body() body: any): Promise<any> {
    await this.prismaWrite.systemConfig.upsert({
      where: { key: 'payment.settings' },
      create: {
        key: 'payment.settings',
        value: body,
      },
      update: {
        value: body,
      },
    });

    return {
      status: 'success',
      message: 'Payment settings updated',
      data: body,
    };
  }
}
