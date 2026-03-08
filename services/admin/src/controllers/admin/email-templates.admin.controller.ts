import { Controller, Get, Patch, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { UserRole, SuccessResponse } from '@nestlancer/common';
import { SuperAdminGuard } from '../../guards/super-admin.guard';

import { EmailTemplatesService } from '../../services/email-templates.service';
import { UpdateEmailTemplateDto } from '../../dto/update-email-template.dto';

/**
 * Controller for managing system email templates.
 * Provides endpoints for listing, retrieving, updating, and testing email templates.
 * 
 * @category Admin
 */
@ApiTags('Admin - Email Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SuperAdminGuard)
@Roles(UserRole.ADMIN)
@Controller('system/email-templates')
export class EmailTemplatesAdminController {
    constructor(private readonly emailService: EmailTemplatesService) { }

    /**
     * Retrieves a list of all defined email templates.
     * 
     * @returns Array of email template metadata
     */
    @Get()
    @ApiOperation({ summary: 'List email templates', description: 'Fetch all available email templates in the system.' })
    @SuccessResponse('Templates retrieved')
    async list(): Promise<any> {
        return this.emailService.findAll();
    }

    /**
     * Retrieves a specific email template by its ID.
     * 
     * @param id The unique identifier of the template
     * @returns Detailed email template object
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get template', description: 'Retrieve the full configuration and body of a specific email template.' })
    @SuccessResponse('Template retrieved')
    async get(@Param('id') id: string): Promise<any> {
        return this.emailService.findOne(id);
    }

    /**
     * Updates an existing email template's subject or body.
     * 
     * @param id The unique identifier of the template
     * @param dto New content for the template
     * @returns Updated email template
     */
    @Patch(':id')
    @ApiOperation({ summary: 'Update template', description: 'Modify the subject line or body content of an existing email template.' })
    @SuccessResponse('Template updated')
    async update(@Param('id') id: string, @Body() dto: UpdateEmailTemplateDto): Promise<any> {
        return this.emailService.update(id, dto);
    }

    /**
     * Generates a preview of the email template with mock data.
     * Compiles the template using Handlebars and returns both HTML and text versions.
     * 
     * @param id The unique identifier of the template
     * @returns Object containing rendered HTML and text previews
     */
    @Get(':id/preview')
    @ApiOperation({ summary: 'Preview template', description: 'Render an email template with example data to visualize how it will appear to users.' })
    @SuccessResponse('Template previewed')
    async preview(@Param('id') id: string): Promise<any> {
        const template = await this.emailService.findOne(id);

        let html = template.body;
        let text = template.body;

        try {
            const Handlebars = require('handlebars');
            const mockData = { name: 'John Doe', action_url: 'https://example.com' };
            const compiledHtml = Handlebars.compile(template.body);
            const compiledText = Handlebars.compile(template.body);
            html = compiledHtml(mockData);
            text = compiledText(mockData);
        } catch (e: any) {
            // Fallback if compilation fails
        }

        return { html, text };
    }

    /**
     * Sends a test email using the specified template to a given recipient.
     * 
     * @param id The unique identifier of the template
     * @param email The recipient's email address
     * @returns Success confirmation
     */
    @Post(':id/test')
    @ApiOperation({ summary: 'Send test email', description: 'Dispatch a live test email using the specified template to a target address.' })
    @SuccessResponse('Test email sent')
    async test(@Param('id') id: string, @Body('email') email: string): Promise<any> {
        return this.emailService.sendTestEmail(id, email);
    }
}
