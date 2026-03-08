import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiStandardResponse, UserRole } from '@nestlancer/common';
import { ActiveUser, JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { QuotesAdminService } from '../services/quotes.admin.service';
import { QuoteStatsService } from '../services/quote-stats.service';
import { CreateQuoteAdminDto } from '../dto/create-quote.admin.dto';

@Controller('admin/quotes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, 'SUPER_ADMIN' as any)
export class QuotesAdminController {
    constructor(
        private readonly adminService: QuotesAdminService,
        private readonly statsService: QuoteStatsService,
    ) { }

    @Get()
    @ApiStandardResponse()
    listQuotes(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20'
    ) {
        return this.adminService.listQuotes(parseInt(page, 10), parseInt(limit, 10));
    }

    @Get('stats')
    @ApiStandardResponse()
    getStats() {
        return this.statsService.getOverallStats();
    }

    @Get('templates')
    @ApiStandardResponse()
    getTemplates() {
        return { templates: [] };
    }

    @Post('templates')
    @ApiStandardResponse({ message: 'Template created' })
    createQuoteTemplate(@ActiveUser('sub') adminId: string, @Body() body: any) {
        return { id: `tpl_${Date.now()}`, createdBy: adminId, ...body };
    }

    @Post()
    @ApiStandardResponse({ message: 'Quote created successfully' })
    async createQuote(
        @ActiveUser('sub') adminId: string,
        @Body() dto: CreateQuoteAdminDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.adminService.createQuote(adminId, dto);
        res.status(HttpStatus.CREATED);
        return result;
    }

    @Post(':id/send')
    @ApiStandardResponse({ message: 'Quote sent successfully' })
    sendQuote(@Param('id') id: string) {
        return this.adminService.sendQuote(id);
    }

    @Post(':id/resend')
    @ApiStandardResponse({ message: 'Quote notification resent' })
    resendQuote(@Param('id') id: string) {
        return this.adminService.sendQuote(id);
    }

    @Get(':id')
    @ApiStandardResponse()
    getQuoteDetails(@Param('id') id: string) {
        // TODO: Get quote details
        return { quoteId: id, details: 'Placeholder' };
    }

    @Patch(':id')
    @ApiStandardResponse({ message: 'Quote updated successfully' })
    updateQuote(@Param('id') id: string, @Body() body: any) {
        // TODO: Update quote
        return { quoteId: id, updated: true, data: body };
    }

    @Delete(':id')
    @ApiStandardResponse({ message: 'Quote deleted successfully' })
    deleteQuote(@Param('id') id: string) {
        // TODO: Delete quote
        return { quoteId: id, deleted: true };
    }

    @Post(':id/duplicate')
    @ApiStandardResponse({ message: 'Quote duplicated successfully' })
    duplicateQuote(@Param('id') id: string) {
        // TODO: Duplicate quote
        return { originalId: id, newQuoteId: `quote_${Date.now()}` };
    }

    @Post(':id/revise')
    @ApiStandardResponse({ message: 'Quote revision created successfully' })
    createRevision(@Param('id') id: string, @Body() body: any) {
        // TODO: Create a revision of a quote
        return { originalId: id, revisionId: `quote_rev_${Date.now()}`, data: body };
    }

    @Get(':id/history')
    @ApiStandardResponse()
    getHistory(@Param('id') id: string) {
        // TODO: Get quote version history
        return { quoteId: id, history: [] };
    }

    @Get(':id/pdf')
    @ApiStandardResponse()
    getAdminPDF(@Param('id') id: string) {
        // TODO: Return admin view PDF of quote
        return { quoteId: id, pdfUrl: 'http://example.com/quote-admin.pdf' };
    }
}
