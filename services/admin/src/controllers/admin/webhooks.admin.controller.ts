import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { UserRole, SuccessResponse } from '@nestlancer/common';
import { SuperAdminGuard } from '../../guards/super-admin.guard';

import { WebhooksManagementService } from '../../services/webhooks-management.service';
import { WebhookDeliveriesService } from '../../services/webhook-deliveries.service';
import { WebhookTestingService } from '../../services/webhook-testing.service';

import { CreateWebhookDto } from '../../dto/create-webhook.dto';
import { UpdateWebhookDto } from '../../dto/update-webhook.dto';
import { TestWebhookDto } from '../../dto/test-webhook.dto';
import { QueryWebhookDeliveriesDto } from '../../dto/query-webhook-deliveries.dto';

@ApiTags('Admin - Webhooks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SuperAdminGuard)
@Roles(UserRole.ADMIN)
@Controller()
export class WebhooksAdminController {
    constructor(
        private readonly webhooksService: WebhooksManagementService,
        private readonly deliveriesService: WebhookDeliveriesService,
        private readonly testingService: WebhookTestingService,
    ) { }

    @Get('webhooks')
    @ApiOperation({ summary: 'List webhooks' })
    @SuccessResponse('Webhooks retrieved')
    async list() {
        return this.webhooksService.findAll();
    }

    @Post('webhooks')
    @ApiOperation({ summary: 'Create webhook' })
    @SuccessResponse('Webhook created')
    async create(@Body() dto: CreateWebhookDto) {
        return this.webhooksService.create(dto);
    }

    @Get('webhooks/health')
    @ApiOperation({ summary: 'Webhooks health check' })
    @SuccessResponse('Webhooks health')
    health() {
        return { status: 'ok', service: 'webhooks-admin' };
    }

    @Get('webhooks/events')
    @ApiOperation({ summary: 'List available webhook events' })
    @SuccessResponse('Available events')
    events() {
        return {
            events: [
                'project.created', 'project.updated', 'project.completed',
                'payment.completed', 'payment.failed', 'payment.refunded',
                'quote.sent', 'quote.accepted', 'quote.declined',
                'message.sent', 'user.registered', 'webhook.test',
            ],
        };
    }

    @Get('webhooks/:id')
    @ApiOperation({ summary: 'Get webhook' })
    @SuccessResponse('Webhook retrieved')
    async get(@Param('id') id: string) {
        return this.webhooksService.findOne(id);
    }

    @Patch('webhooks/:id')
    @ApiOperation({ summary: 'Update webhook' })
    @SuccessResponse('Webhook updated')
    async update(@Param('id') id: string, @Body() dto: UpdateWebhookDto) {
        return this.webhooksService.update(id, dto);
    }

    @Delete('webhooks/:id')
    @ApiOperation({ summary: 'Delete webhook' })
    @SuccessResponse('Webhook deleted')
    async remove(@Param('id') id: string) {
        return this.webhooksService.remove(id);
    }

    @Post('webhooks/:id/test')
    @ApiOperation({ summary: 'Test webhook' })
    @SuccessResponse()
    async test(@Param('id') id: string, @Body() dto: TestWebhookDto) {
        return this.testingService.testDelivery(id, dto);
    }

    @Get('webhooks/:id/deliveries')
    @ApiOperation({ summary: 'Get webhook deliveries' })
    @SuccessResponse('Deliveries retrieved')
    async getDeliveries(@Param('id') id: string, @Query() query: QueryWebhookDeliveriesDto) {
        return this.deliveriesService.findAll(id, query);
    }

    @Post('webhooks/:id/enable')
    @ApiOperation({ summary: 'Enable webhook' })
    @SuccessResponse('Webhook enabled')
    async enableWebhook(@Param('id') id: string) {
        // TODO: Enable webhook
        return { id, status: 'active' };
    }

    @Post('webhooks/:id/disable')
    @ApiOperation({ summary: 'Disable webhook' })
    @SuccessResponse('Webhook disabled')
    async disableWebhook(@Param('id') id: string) {
        // TODO: Disable webhook
        return { id, status: 'disabled' };
    }

    @Get('webhooks/:id/deliveries/:deliveryId')
    @ApiOperation({ summary: 'Get delivery details' })
    @SuccessResponse('Delivery details retrieved')
    async getDeliveryDetails(@Param('id') id: string, @Param('deliveryId') deliveryId: string) {
        // TODO: Get delivery details
        return { id: deliveryId, webhookId: id, details: {} };
    }

    @Post('webhooks/:id/deliveries/:deliveryId/retry')
    @ApiOperation({ summary: 'Retry delivery' })
    @SuccessResponse('Delivery retry initiated')
    async retryDelivery(@Param('id') id: string, @Param('deliveryId') deliveryId: string) {
        // TODO: Retry a failed webhook delivery
        return { id: deliveryId, webhookId: id, status: 'pending' };
    }

    @Get('webhooks/:id/stats')
    @ApiOperation({ summary: 'Get webhook statistics' })
    @SuccessResponse('Webhook stats retrieved')
    async getWebhookStats(@Param('id') id: string) {
        // TODO: Get webhook stats (success rate, volume, etc)
        return { webhookId: id, total: 0, failed: 0, successRate: 100 };
    }
}
