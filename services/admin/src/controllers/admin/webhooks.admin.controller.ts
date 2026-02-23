import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { UserRole } from '@nestlancer/common/enums/role.enum';
import { SuccessResponse } from '@nestlancer/common/decorators/success-response.decorator';
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
    @SuccessResponse('Webhook created', 201)
    async create(@Body() dto: CreateWebhookDto) {
        return this.webhooksService.create(dto);
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
}
