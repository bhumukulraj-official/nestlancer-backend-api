import { Controller, Get, Patch, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { UserRole } from '@nestlancer/common/enums/role.enum';
import { SuccessResponse } from '@nestlancer/common/decorators/success-response.decorator';
import { SuperAdminGuard } from '../../guards/super-admin.guard';

import { EmailTemplatesService } from '../../services/email-templates.service';
import { UpdateEmailTemplateDto } from '../../dto/update-email-template.dto';

@ApiTags('Admin - Email Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SuperAdminGuard)
@Roles(UserRole.ADMIN)
@Controller('system/email-templates')
export class EmailTemplatesAdminController {
    constructor(private readonly emailService: EmailTemplatesService) { }

    @Get()
    @ApiOperation({ summary: 'List email templates' })
    @SuccessResponse('Templates retrieved')
    async list() {
        return this.emailService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get template' })
    @SuccessResponse('Template retrieved')
    async get(@Param('id') id: string) {
        return this.emailService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update template' })
    @SuccessResponse('Template updated')
    async update(@Param('id') id: string, @Body() dto: UpdateEmailTemplateDto) {
        return this.emailService.update(id, dto);
    }

    @Get(':id/preview')
    @ApiOperation({ summary: 'Preview template' })
    @SuccessResponse('Template previewed')
    async preview(@Param('id') id: string) {
        const template = await this.emailService.findOne(id);

        let html = template.htmlBody;
        let text = template.textBody;

        try {
            const Handlebars = require('handlebars');
            const mockData = { name: 'John Doe', action_url: 'https://example.com' };
            const compiledHtml = Handlebars.compile(template.htmlBody);
            const compiledText = Handlebars.compile(template.textBody);
            html = compiledHtml(mockData);
            text = compiledText(mockData);
        } catch (e) {
            // Fallback if compilation fails
        }

        return { html, text };
    }

    @Post(':id/test')
    @ApiOperation({ summary: 'Send test email' })
    @SuccessResponse('Test email sent')
    async test(@Param('id') id: string, @Body('email') email: string) {
        return this.emailService.sendTestEmail(id, email);
    }
}
