import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '@nestlancer/common';
import { HttpProxyService } from '../../proxy';

/**
 * Webhooks Gateway Controller
 * Routes webhook requests to the Webhooks Service
 * Public endpoints for receiving webhooks from external providers
 */
@Controller('webhooks')
@ApiTags('webhooks')
export class WebhooksController {
  constructor(private readonly proxy: HttpProxyService) {}

  // --- Incoming Webhooks (Public) ---

  @Post('razorpay')
  @Public()
  @ApiOperation({ summary: 'Razorpay webhook endpoint' })
  async handleRazorpay(@Req() req: Request) {
    return this.proxy.forward('webhooks', req);
  }

  @Post('github')
  @Public()
  @ApiOperation({ summary: 'GitHub webhook endpoint' })
  async handleGithub(@Req() req: Request) {
    return this.proxy.forward('webhooks', req);
  }

  @Post('stripe')
  @Public()
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async handleStripe(@Req() req: Request) {
    return this.proxy.forward('webhooks', req);
  }

  @Post(':provider')
  @Public()
  @ApiOperation({ summary: 'Generic webhook endpoint for any provider' })
  async handleProvider(@Req() req: Request) {
    return this.proxy.forward('webhooks', req);
  }

  // --- Webhook Management (Authenticated) ---

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List configured webhooks' })
  async findAll(@Req() req: Request) {
    return this.proxy.forward('webhooks', req);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create webhook configuration' })
  async create(@Req() req: Request) {
    return this.proxy.forward('webhooks', req);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get webhook configuration' })
  async findOne(@Req() req: Request) {
    return this.proxy.forward('webhooks', req);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update webhook configuration' })
  async update(@Req() req: Request) {
    return this.proxy.forward('webhooks', req);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete webhook configuration' })
  async remove(@Req() req: Request) {
    return this.proxy.forward('webhooks', req);
  }

  @Post(':id/test')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test webhook' })
  async testWebhook(@Req() req: Request) {
    return this.proxy.forward('webhooks', req);
  }

  @Post(':id/regenerate-secret')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Regenerate webhook secret' })
  async regenerateSecret(@Req() req: Request) {
    return this.proxy.forward('webhooks', req);
  }

  // --- Webhook Logs ---

  @Get('logs')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List webhook delivery logs' })
  async getLogs(@Req() req: Request) {
    return this.proxy.forward('webhooks', req);
  }

  @Get('logs/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get webhook log details' })
  async getLog(@Req() req: Request) {
    return this.proxy.forward('webhooks', req);
  }

  @Post('logs/:id/retry')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retry failed webhook delivery' })
  async retryWebhook(@Req() req: Request) {
    return this.proxy.forward('webhooks', req);
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Webhooks service health check' })
  async health(@Req() req: Request) {
    return this.proxy.forward('webhooks', req);
  }
}
