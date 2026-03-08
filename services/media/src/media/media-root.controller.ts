import { Controller, Get, Post, Param, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { DirectUploadDto } from '../dto/direct-upload.dto';
import { JwtAuthGuard, CurrentUser, AuthenticatedUser } from '@nestlancer/auth-lib';
import { ApiStandardResponse } from '@nestlancer/common';

/**
 * Routes at /api/v1/... when gateway strips /media (e.g. GET /api/v1/media/health -> GET /api/v1/health).
 */
@Controller()
@UseGuards(JwtAuthGuard)
export class MediaRootController {
    constructor(private readonly mediaService: MediaService) { }

    @Get('health')
    health() {
        return { status: 'ok', service: 'media' };
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiStandardResponse(Object)
    async upload(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: DirectUploadDto,
        @UploadedFile() file: any,
    ) {
        return this.mediaService.directUpload(user.userId, dto, file);
    }

    @Get('stats')
    @ApiStandardResponse(Object)
    async getStats(@CurrentUser() user: AuthenticatedUser) {
        return this.mediaService.getStorageStats(user.userId);
    }

    @Get(':id/status')
    @ApiStandardResponse(Object)
    async getProcessingStatus(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
    ) {
        return this.mediaService.getProcessingStatus(id, user.userId);
    }
}
