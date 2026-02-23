import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { NotificationTemplatesService } from './notification-templates.service';
import { CreateNotificationTemplateDto } from '../dto/create-notification-template.dto';
import { UpdateNotificationTemplateDto } from '../dto/update-notification-template.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { UserRole } from '@nestlancer/common/enums/role.enum';
import { ApiStandardResponse } from '@nestlancer/common/decorators/api-standard-response.decorator';

@Controller('admin/notification-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class NotificationTemplatesAdminController {
    constructor(private readonly templatesService: NotificationTemplatesService) { }

    @Get()
    @ApiStandardResponse(Object)
    async getTemplates() {
        return this.templatesService.findAll();
    }

    @Post()
    @ApiStandardResponse(Object)
    async createTemplate(@Body() dto: CreateNotificationTemplateDto) {
        return this.templatesService.create(dto);
    }

    @Patch(':id')
    @ApiStandardResponse(Object)
    async updateTemplate(@Param('id') id: string, @Body() dto: UpdateNotificationTemplateDto) {
        return this.templatesService.update(id, dto);
    }

    @Delete(':id')
    @ApiStandardResponse(Object)
    async deleteTemplate(@Param('id') id: string) {
        return this.templatesService.delete(id);
    }
}
