import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiStandardResponse, UserRole } from '@nestlancer/common';
import { ActiveUser, JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { RequestsAdminService } from '../services/requests.admin.service';
import { QuotesAdminService } from '../services/quotes.admin.service';
import { RequestStatsService } from '../services/request-stats.service';
import { UpdateRequestStatusDto } from '../dto/update-request-status.dto';
import { CreateQuoteDto } from '../dto/create-quote.dto';
import { AddNoteDto } from '../dto/add-note.dto';

@Controller('admin/requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, 'SUPER_ADMIN' as any)
export class RequestsAdminController {
    constructor(
        private readonly adminService: RequestsAdminService,
        private readonly quotesService: QuotesAdminService,
        private readonly statsService: RequestStatsService,
    ) { }

    @Get()
    @ApiStandardResponse()
    listRequests(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
        @Query('status') status?: string
    ) {
        return this.adminService.listRequests(parseInt(page, 10), parseInt(limit, 10), status);
    }

    @Get('stats')
    @ApiStandardResponse()
    getOverallStats() {
        return this.statsService.getOverallStats();
    }

    @Get(':id')
    @ApiStandardResponse()
    getRequestDetails(@Param('id') id: string) {
        return this.adminService.getRequestDetailsAdmin(id);
    }

    @Patch(':id/status')
    @ApiStandardResponse({ message: 'Request status updated successfully' })
    updateRequestStatus(
        @Param('id') id: string,
        @ActiveUser('sub') adminId: string,
        @Body() dto: UpdateRequestStatusDto
    ) {
        return this.adminService.updateRequestStatus(id, adminId, dto.status, dto.notes);
    }

    @Post(':id/quotes')
    @ApiStandardResponse({ message: 'Quote created successfully' })
    async createQuote(
        @Param('id') id: string,
        @ActiveUser('sub') adminId: string,
        @Body() dto: CreateQuoteDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.quotesService.createQuote(id, adminId, dto);
        res.status(HttpStatus.CREATED);
        return result;
    }

    @Post(':id/notes')
    @ApiStandardResponse({ message: 'Internal note added' })
    async addNote(
        @Param('id') id: string,
        @ActiveUser('sub') adminId: string,
        @Body() dto: AddNoteDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.adminService.addNote(id, adminId, dto.content);
        res.status(HttpStatus.CREATED);
        return result;
    }

    @Get(':id/notes')
    @ApiStandardResponse()
    getNotes(@Param('id') id: string) {
        return this.adminService.getNotes(id);
    }
}
