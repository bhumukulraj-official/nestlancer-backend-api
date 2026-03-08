import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile, HttpStatus, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiStandardResponse, Public } from '@nestlancer/common';
import { ActiveUser, JwtAuthGuard } from '@nestlancer/auth-lib';
import { RequestsService } from '../services/requests.service';
import { RequestAttachmentsService } from '../services/request-attachments.service';
import { RequestStatsService } from '../services/request-stats.service';
import { CreateRequestDto } from '../dto/create-request.dto';
import { UpdateRequestDto } from '../dto/update-request.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class RequestsController {
    constructor(
        private readonly requestsService: RequestsService,
        private readonly attachmentsService: RequestAttachmentsService,
        private readonly statsService: RequestStatsService,
    ) { }

    @Public()
    @Get('health')
    @ApiStandardResponse()
    healthCheck() {
        return { status: 'ok', service: 'requests' };
    }

    @Post()
    @ApiStandardResponse({ message: 'Request created successfully in draft status' })
    async createRequest(
        @ActiveUser('sub') userId: string,
        @Body() dto: CreateRequestDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.requestsService.createRequest(userId, dto);
        res.status(HttpStatus.CREATED);
        return result;
    }

    @Get()
    @ApiStandardResponse()
    listRequests(@ActiveUser('sub') userId: string) {
        return this.requestsService.getMyRequests(userId);
    }

    @Get('stats')
    @ApiStandardResponse()
    getStats(@ActiveUser('sub') userId: string): Promise<any> | any {
        return this.statsService.getUserStats(userId);
    }

    @Get(':id/status')
    @ApiStandardResponse()
    getStatusTimeline(@ActiveUser('sub') userId: string, @Param('id') id: string) {
        return this.requestsService.getStatusTimeline(userId, id);
    }

    @Get(':id')
    @ApiStandardResponse()
    getRequestDetails(@ActiveUser('sub') userId: string, @Param('id') id: string) {
        return this.requestsService.getRequestDetails(userId, id);
    }

    @Patch(':id')
    @ApiStandardResponse({ message: 'Request updated successfully' })
    updateRequest(@ActiveUser('sub') userId: string, @Param('id') id: string, @Body() dto: UpdateRequestDto) {
        return this.requestsService.updateRequest(userId, id, dto);
    }

    @Post(':id/submit')
    @ApiStandardResponse({ message: 'Request submitted successfully. You will receive a quote within 24-48 hours.' })
    submitRequest(@ActiveUser('sub') userId: string, @Param('id') id: string) {
        return this.requestsService.submitRequest(userId, id);
    }

    @Delete(':id')
    @ApiStandardResponse({ message: 'Request deleted successfully' })
    deleteRequest(@ActiveUser('sub') userId: string, @Param('id') id: string) {
        return this.requestsService.deleteRequest(userId, id);
    }

    // --- Attachments ---

    @Get(':id/attachments')
    @ApiStandardResponse()
    getAttachments(@ActiveUser('sub') userId: string, @Param('id') id: string) {
        return this.attachmentsService.getAttachments(userId, id);
    }

    @Post(':id/attachments')
    @UseInterceptors(FileInterceptor('file'))
    @ApiStandardResponse({ message: 'Attachment uploaded successfully' })
    async addAttachment(
        @ActiveUser('sub') userId: string,
        @Param('id') id: string,
        @UploadedFile() file: any,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.attachmentsService.addAttachment(userId, id, file);
        res.status(HttpStatus.CREATED);
        return result;
    }

    @Delete(':id/attachments/:attachmentId')
    @ApiStandardResponse({ message: 'Attachment removed successfully' })
    removeAttachment(
        @ActiveUser('sub') userId: string,
        @Param('id') id: string,
        @Param('attachmentId') attachmentId: string
    ) {
        return this.attachmentsService.removeAttachment(userId, id, attachmentId);
    }

    @Get(':id/quotes')
    @ApiStandardResponse()
    getRequestQuotes(@ActiveUser('sub') userId: string, @Param('id') id: string) {
        // TODO: Get quotes for a request
        return { requestId: id, quotes: [] };
    }
}
