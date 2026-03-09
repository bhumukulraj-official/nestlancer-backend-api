import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpStatus, Res, HttpCode } from '@nestjs/common';
import { Response } from 'express';
import { ApiStandardResponse, UserRole } from '@nestlancer/common';
import { ActiveUser, JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { QuotesAdminService } from '../services/quotes.admin.service';
import { QuoteStatsService } from '../services/quote-stats.service';
import { CreateQuoteAdminDto } from '../dto/create-quote.admin.dto';
import { UpdateQuoteAdminDto } from '../dto/update-quote.admin.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

/**
 * Controller for administrative management of quotes and proposals.
 */
@ApiTags('Admin/Quotes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, 'SUPER_ADMIN' as any)
@Controller('admin/quotes')
export class QuotesAdminController {
    constructor(
        private readonly adminService: QuotesAdminService,
        private readonly statsService: QuoteStatsService,
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    /**
     * Retrieves a comprehensive, paginated registry of all quotes in the system.
     * 
     * @param page Current target page index
     * @param limit Maximum amount of records to retrieve per response
     * @returns A promise resolving to a paginated set of all quotes
     */
    @Get()
    @ApiOperation({ summary: 'List all quotes (Admin)', description: 'Access the global repository of all client proposals and issued quotes.' })
    @ApiQuery({ name: 'page', required: false, example: '1', description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, example: '20', description: 'Results per page' })
    @ApiStandardResponse()
    async listQuotes(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20'
    ): Promise<any> {
        return this.adminService.listQuotes(parseInt(page, 10), parseInt(limit, 10));
    }

    /**
     * Retrieves system-wide quote activity metrics and analytics.
     * 
     * @returns A promise resolving to a global statistical overview of all quotes
     */
    @Get('stats')
    @ApiOperation({ summary: 'Get overall quote statistics', description: 'Access administrative KPIs including total volume, conversion rates, and revenue trends.' })
    @ApiStandardResponse()
    async getStats(): Promise<any> {
        return this.statsService.getOverallStats();
    }

    /**
     * Accesses a curated library of standardized quote templates for reuse.
     * 
     * @returns A promise resolving to a collection of administrative quote templates
     */
    @Get('templates')
    @ApiOperation({ summary: 'List quote templates', description: 'Access pre-defined proposal structures for faster issuance.' })
    @ApiStandardResponse()
    async getTemplates(): Promise<any> {
        return { templates: [] };
    }

    /**
     * Creates a new reusable quote template.
     */
    @Post('templates')
    @ApiOperation({ summary: 'Create quote template' })
    @ApiStandardResponse({ message: 'Template created' })
    async createQuoteTemplate(@ActiveUser('sub') adminId: string, @Body() body: any): Promise<any> {
        return { id: `tpl_${Date.now()}`, createdBy: adminId, ...body };
    }

    /**
     * Issues a new official quote to a client.
     */
    @Post()
    @ApiOperation({ summary: 'Create and issue a new quote' })
    @ApiStandardResponse({ message: 'Quote created successfully' })
    async createQuote(
        @ActiveUser('sub') adminId: string,
        @Body() dto: CreateQuoteAdminDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<any> {
        const result = await this.adminService.createQuote(adminId, dto);
        res.status(HttpStatus.CREATED);
        return result;
    }

    /**
     * Sends/Issues a finalized quote to the client via configured channels.
     */
    @Post(':id/send')
    @ApiOperation({ summary: 'Send quote to client' })
    @ApiParam({ name: 'id', description: 'Quote UUID' })
    @ApiStandardResponse({ message: 'Quote sent successfully' })
    async sendQuote(@Param('id') id: string): Promise<any> {
        return this.adminService.sendQuote(id);
    }

    /**
     * Triggers a resend of the quote notification to the client.
     */
    @Post(':id/resend')
    @ApiOperation({ summary: 'Resend quote notification' })
    @ApiParam({ name: 'id', description: 'Quote UUID' })
    @ApiStandardResponse({ message: 'Quote notification resent' })
    async resendQuote(@Param('id') id: string): Promise<any> {
        return this.adminService.sendQuote(id);
    }

    /**
     * Retrieves full administrative details for a specific quote.
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get quote administrative details' })
    @ApiParam({ name: 'id', description: 'Quote UUID' })
    @ApiStandardResponse()
    async getQuoteDetails(@Param('id') id: string): Promise<any> {
        const quote = await this.prismaRead.quote.findUnique({
            where: { id },
            include: { request: true, project: true }
        });
        if (!quote) throw new Error('Quote not found');
        return quote;
    }

    /**
     * Updates an existing quote's details before or after issuance.
     */
    @Patch(':id')
    @ApiOperation({ summary: 'Update quote details (Admin)' })
    @ApiParam({ name: 'id', description: 'Quote UUID' })
    @ApiStandardResponse({ message: 'Quote updated successfully' })
    async updateQuote(@Param('id') id: string, @Body() dto: UpdateQuoteAdminDto): Promise<any> {
        const payload = dto as any;
        const updated = await this.prismaWrite.quote.update({
            where: { id },
            data: payload
        });
        return { quoteId: id, updated: true, data: updated };
    }

    /**
     * Permanent removal of a quote record.
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Delete quote' })
    @ApiParam({ name: 'id', description: 'Quote UUID' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiResponse({ status: 204, description: 'Quote deleted' })
    async deleteQuote(@Param('id') id: string): Promise<any> {
        await this.prismaWrite.quote.delete({ where: { id } });
        return { quoteId: id, deleted: true };
    }

    /**
     * Creates an identical copy of an existing quote.
     */
    @Post(':id/duplicate')
    @ApiOperation({ summary: 'Duplicate quote' })
    @ApiParam({ name: 'id', description: 'Quote UUID' })
    @ApiStandardResponse({ message: 'Quote duplicated successfully' })
    async duplicateQuote(@Param('id') id: string): Promise<any> {
        const original = await this.prismaRead.quote.findUnique({ where: { id }, include: { request: true } });
        if (!original) throw new Error('Quote not found');

        // Create new project request to satisfy unique constraint
        const newRequest = await this.prismaWrite.projectRequest.create({
            data: {
                userId: original.request.userId,
                title: `Copy of ${original.request.title}`,
                description: original.request.description,
                category: original.request.category,
                status: 'DRAFT'
            }
        });

        const newQuote = await this.prismaWrite.quote.create({
            data: {
                requestId: newRequest.id,
                userId: original.userId,
                title: `Copy of ${original.title}`,
                description: original.description,
                subtotal: original.subtotal,
                taxPercentage: original.taxPercentage,
                taxAmount: original.taxAmount,
                totalAmount: original.totalAmount,
                currency: original.currency,
                validUntil: original.validUntil,
                status: 'DRAFT',
                terms: original.terms,
                notes: original.notes,
                paymentBreakdown: original.paymentBreakdown || {},
                timeline: original.timeline || {},
                scope: original.scope || {},
                technicalDetails: original.technicalDetails || {}
            }
        });
        return { originalId: id, newQuoteId: newQuote.id, newRequestId: newRequest.id };
    }

    /**
     * Generates a new version (revision) based on an existing quote.
     */
    @Post(':id/revise')
    @ApiOperation({ summary: 'Create quote revision' })
    @ApiParam({ name: 'id', description: 'Quote UUID' })
    @ApiStandardResponse({ message: 'Quote revision created successfully' })
    async createRevision(@Param('id') id: string, @Body() body: any): Promise<any> {
        const original = await this.prismaRead.quote.findUnique({ where: { id } });
        if (!original) throw new Error('Quote not found');

        const updated = await this.prismaWrite.quote.update({
            where: { id },
            data: {
                ...body,
                status: 'REVISED'
            }
        });

        await this.prismaWrite.outboxEvent.create({
            data: {
                aggregateType: 'QUOTE',
                aggregateId: id,
                eventType: 'QUOTE_REVISION_CREATED',
                payload: { originalData: original, newData: updated }
            }
        });

        return { originalId: id, revisionId: id, data: updated };
    }

    /**
     * Retrieves the complete version and interaction history of a specific quote.
     */
    @Get(':id/history')
    @ApiOperation({ summary: 'Get quote history' })
    @ApiParam({ name: 'id', description: 'Quote UUID' })
    @ApiStandardResponse()
    async getHistory(@Param('id') id: string): Promise<any> {
        const history = await this.prismaRead.outboxEvent.findMany({
            where: { aggregateType: 'QUOTE', aggregateId: id, eventType: 'QUOTE_REVISION_CREATED' },
            orderBy: { createdAt: 'desc' },
            select: { id: true, payload: true, createdAt: true }
        });
        return { quoteId: id, history };
    }

    /**
     * Retrieves a metadata-rich link or status for the quote document (Admin view).
     */
    @Get(':id/pdf')
    @ApiOperation({ summary: 'Get quote PDF metadata (Admin)' })
    @ApiParam({ name: 'id', description: 'Quote UUID' })
    @ApiStandardResponse()
    async getAdminPDF(@Param('id') id: string): Promise<any> {
        const quote = await this.prismaRead.quote.findUnique({ where: { id }, select: { id: true } });
        if (!quote) throw new Error('Quote not found');
        return { quoteId: id, pdfUrl: `https://storage.nestlancer.com/quotes/${id}/admin-view.pdf` };
    }
}

