import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiStandardResponse } from '@nestlancer/common/decorators/api-standard-response.decorator';
import { ActiveUser } from '@nestlancer/auth-lib/decorators/active-user.decorator';
import { JwtAuthGuard } from '@nestlancer/auth-lib/guards/jwt-auth.guard';
import { RolesGuard } from '@nestlancer/auth-lib/guards/roles.guard';
import { Roles } from '@nestlancer/auth-lib/decorators/roles.decorator';
import { UserRole } from '@nestlancer/common/enums/role.enum';
import { QuotesAdminService } from '../services/quotes.admin.service';
import { QuoteStatsService } from '../services/quote-stats.service';
import { CreateQuoteAdminDto } from '../dto/create-quote.admin.dto';

@Controller('admin/quotes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
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
}
