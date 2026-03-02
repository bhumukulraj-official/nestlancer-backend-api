import { Controller, Get, Post, Body, Param, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiStandardResponse, Public } from '@nestlancer/common';
import { ActiveUser, JwtAuthGuard } from '@nestlancer/auth-lib';
import { QuotesService } from '../services/quotes.service';
import { QuoteStatusService } from '../services/quote-status.service';
import { QuotePdfService } from '../services/quote-pdf.service';
import { QuoteStatsService } from '../services/quote-stats.service';
import { AcceptQuoteDto } from '../dto/accept-quote.dto';
import { DeclineQuoteDto } from '../dto/decline-quote.dto';
import { RequestQuoteChangesDto } from '../dto/request-quote-changes.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class QuotesController {
    constructor(
        private readonly quotesService: QuotesService,
        private readonly statusService: QuoteStatusService,
        private readonly pdfService: QuotePdfService,
        private readonly statsService: QuoteStatsService,
    ) { }

    @Public()
    @Get('health')
    @ApiStandardResponse()
    healthCheck() {
        return { status: 'ok', service: 'quotes' };
    }

    @Get()
    @ApiStandardResponse()
    listQuotes(@ActiveUser('sub') userId: string) {
        return this.quotesService.getMyQuotes(userId);
    }

    @Get('stats')
    @ApiStandardResponse()
    getStats(@ActiveUser('sub') userId: string) {
        return this.statsService.getUserStats(userId);
    }

    @Get(':id')
    @ApiStandardResponse()
    getQuoteDetails(@ActiveUser('sub') userId: string, @Param('id') id: string) {
        return this.quotesService.getQuoteDetails(userId, id);
    }

    @Post(':id/accept')
    @ApiStandardResponse({ message: 'Quote accepted successfully. Project has been created.' })
    acceptQuote(@ActiveUser('sub') userId: string, @Param('id') id: string, @Body() dto: AcceptQuoteDto) {
        return this.statusService.acceptQuote(userId, id, dto);
    }

    @Post(':id/decline')
    @ApiStandardResponse({ message: 'Quote declined. Your feedback has been sent.' })
    declineQuote(@ActiveUser('sub') userId: string, @Param('id') id: string, @Body() dto: DeclineQuoteDto) {
        return this.statusService.declineQuote(userId, id, dto);
    }

    @Post(':id/request-changes')
    @ApiStandardResponse({ message: 'Change request submitted.' })
    requestChanges(@ActiveUser('sub') userId: string, @Param('id') id: string, @Body() dto: RequestQuoteChangesDto) {
        return this.statusService.requestChanges(userId, id, dto);
    }

    @Get(':id/pdf')
    async downloadPdf(
        @ActiveUser('sub') userId: string,
        @Param('id') id: string,
        @Res() res: Response
    ) {
        const buffer = await this.pdfService.generatePdf(userId, id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="quote-${id}.pdf"`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
}
