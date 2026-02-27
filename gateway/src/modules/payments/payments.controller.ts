import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { HttpProxyService } from '../../proxy';

/**
 * Payments Gateway Controller
 * Routes payment requests to the Payments Service
 */
@Controller('payments')
@ApiTags('payments')
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly proxy: HttpProxyService) {}

  // --- Payment Intents ---

  @Post('intents')
  @ApiOperation({ summary: 'Create a payment intent' })
  async createIntent(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm a payment' })
  async confirmPayment(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  // --- User Payments ---

  @Get()
  @ApiOperation({ summary: 'List user payments' })
  async getMyPayments(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment details' })
  async getPaymentDetails(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Check payment status' })
  async getPaymentStatus(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Get(':id/receipt')
  @ApiOperation({ summary: 'Download payment receipt' })
  async downloadReceipt(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Download payment invoice' })
  async downloadInvoice(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel pending payment' })
  async cancelPayment(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  // --- Project Payments ---

  @Get('projects/:projectId')
  @ApiOperation({ summary: 'Get project payments' })
  async getProjectPayments(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Get('projects/:projectId/milestones')
  @ApiOperation({ summary: 'Get payment milestones' })
  async getProjectMilestones(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  // --- Payment Methods ---

  @Get('methods')
  @ApiOperation({ summary: 'List saved payment methods' })
  async getPaymentMethods(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Post('methods')
  @ApiOperation({ summary: 'Save payment method' })
  async savePaymentMethod(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Delete('methods/:id')
  @ApiOperation({ summary: 'Remove payment method' })
  async removePaymentMethod(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  // --- Statistics ---

  @Get('stats')
  @ApiOperation({ summary: 'User payment statistics' })
  async getPaymentStats(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Get('health')
  @ApiOperation({ summary: 'Payments service health check' })
  async health(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }
}
