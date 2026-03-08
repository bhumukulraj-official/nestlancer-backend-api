import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpStatus, Res, HttpCode } from '@nestjs/common';
import { Response } from 'express';
import { ApiStandardResponse, UserRole } from '@nestlancer/common';
import { ActiveUser, JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { RequestsAdminService } from '../services/requests.admin.service';
import { QuotesAdminService } from '../services/quotes.admin.service';
import { RequestStatsService } from '../services/request-stats.service';
import { UpdateRequestStatusDto } from '../dto/update-request-status.dto';
import { CreateQuoteDto } from '../dto/create-quote.dto';
import { AddNoteDto } from '../dto/add-note.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

/**
 * Controller for administrative management and review of project requests.
 */
@ApiTags('Admin/Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, 'SUPER_ADMIN' as any)
@Controller('admin/requests')
export class RequestsAdminController {
    constructor(
        private readonly adminService: RequestsAdminService,
        private readonly quotesService: QuotesAdminService,
        private readonly statsService: RequestStatsService,
    ) { }

    /**
     * Retrieves a global registry of all project requests in the system.
     * Supports administrative filtering by status and paginated viewing.
     * 
     * @param page Current target page index
     * @param limit Maximum amount of records to retrieve per response
     * @param status Optional filter for project request status
     * @returns A promise resolving to a paginated collection of all matching requests
     */
    @Get()
    @ApiOperation({ summary: 'List all requests (Admin)', description: 'Access the system-wide repository of all project proposals for review.' })
    @ApiQuery({ name: 'page', required: false, example: '1', description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, example: '20', description: 'Results per page' })
    @ApiQuery({ name: 'status', required: false, example: 'submitted', description: 'Filter by request status' })
    @ApiStandardResponse()
    async listRequests(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
        @Query('status') status?: string
    ): Promise<any> {
        return this.adminService.listRequests(parseInt(page, 10), parseInt(limit, 10), status);
    }

    /**
     * Retrieves aggregated administrative statistics for all project requests platform-wide.
     * Includes volume trends, conversion rates, and status distribution.
     * 
     * @returns A promise resolving to a global statistical overview of all project requests
     */
    @Get('stats')
    @ApiOperation({ summary: 'Get overall request statistics', description: 'Access administrative KPIs and volume data for all user project proposals.' })
    @ApiStandardResponse()
    async getOverallStats(): Promise<any> {
        return this.statsService.getOverallStats();
    }

    /**
     * Accesses the full administrative record and audit Trail for a single project request.
     * 
     * @param id The unique identifier of the requested project
     * @returns A promise resolving to the comprehensive request administrative details
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get request administrative details', description: 'Retrieve detailed metadata, content, and history for any project proposal.' })
    @ApiParam({ name: 'id', description: 'Request UUID' })
    @ApiStandardResponse()
    async getRequestDetails(@Param('id') id: string): Promise<any> {
        return this.adminService.getRequestDetailsAdmin(id);
    }

    /**
     * Transitions a request to a new status and adds administrative notes.
     */
    @Patch(':id/status')
    @ApiOperation({ summary: 'Update request status (Admin)' })
    @ApiParam({ name: 'id', description: 'Request UUID' })
    @ApiStandardResponse({ message: 'Request status updated successfully' })
    async updateRequestStatus(
        @Param('id') id: string,
        @ActiveUser('sub') adminId: string,
        @Body() dto: UpdateRequestStatusDto
    ): Promise<any> {
        return this.adminService.updateRequestStatus(id, adminId, dto.status, dto.notes);
    }

    /**
     * Issues a formal quote based on a reviewed project request.
     */
    @Post(':id/quotes')
    @ApiOperation({ summary: 'Create quote from request' })
    @ApiParam({ name: 'id', description: 'Request UUID' })
    @ApiStandardResponse({ message: 'Quote created successfully' })
    async createQuote(
        @Param('id') id: string,
        @ActiveUser('sub') adminId: string,
        @Body() dto: CreateQuoteDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<any> {
        const result = await this.quotesService.createQuote(id, adminId, dto);
        res.status(HttpStatus.CREATED);
        return result;
    }

    /**
     * Adds an internal administrative note to a request record.
     */
    @Post(':id/notes')
    @ApiOperation({ summary: 'Add internal note' })
    @ApiParam({ name: 'id', description: 'Request UUID' })
    @ApiStandardResponse({ message: 'Internal note added' })
    async addNote(
        @Param('id') id: string,
        @ActiveUser('sub') adminId: string,
        @Body() dto: AddNoteDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<any> {
        const result = await this.adminService.addNote(id, adminId, dto.content);
        res.status(HttpStatus.CREATED);
        return result;
    }

    /**
     * Lists all internal notes associated with a project request.
     */
    @Get(':id/notes')
    @ApiOperation({ summary: 'List request notes' })
    @ApiParam({ name: 'id', description: 'Request UUID' })
    @ApiStandardResponse()
    async getNotes(@Param('id') id: string): Promise<any> {
        return this.adminService.getNotes(id);
    }

    /**
     * Updates an existing request's core details (Admin override).
     */
    @Patch(':id')
    @ApiOperation({ summary: 'Update request details (Admin)' })
    @ApiParam({ name: 'id', description: 'Request UUID' })
    @ApiStandardResponse({ message: 'Request updated successfully' })
    async updateRequest(
        @Param('id') id: string,
        @ActiveUser('sub') adminId: string,
        @Body() body: any
    ): Promise<any> {
        // TODO: Admin update request
        return { requestId: id, updated: true, data: body };
    }

    /**
     * Assigns a staff member or team to a specific project request.
     */
    @Post(':id/assign')
    @ApiOperation({ summary: 'Assign request to staff' })
    @ApiParam({ name: 'id', description: 'Request UUID' })
    @ApiStandardResponse({ message: 'Request assigned successfully' })
    async assignRequest(
        @Param('id') id: string,
        @ActiveUser('sub') adminId: string,
        @Body() body: { assigneeId: string }
    ): Promise<any> {
        // TODO: Admin assign request
        return { requestId: id, assignedTo: body.assigneeId, assignedBy: adminId };
    }

    /**
     * Permanent removal of a project request record (Admin only).
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Delete request (Admin)' })
    @ApiParam({ name: 'id', description: 'Request UUID' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiResponse({ status: 204, description: 'Request deleted' })
    async deleteRequest(@Param('id') id: string): Promise<any> {
        // TODO: Admin delete request
        return { requestId: id, deleted: true };
    }
}

