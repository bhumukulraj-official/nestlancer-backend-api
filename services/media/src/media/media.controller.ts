import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { RequestUploadDto } from '../dto/request-upload.dto';
import { ConfirmUploadDto } from '../dto/confirm-upload.dto';
import { DirectUploadDto } from '../dto/direct-upload.dto';
import { UpdateMediaMetadataDto } from '../dto/update-media-metadata.dto';
import { QueryMediaDto } from '../dto/query-media.dto';
import { JwtAuthGuard, CurrentUser, AuthenticatedUser } from '@nestlancer/auth-lib';
import { ApiStandardResponse } from '@nestlancer/common';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Get()
    @ApiStandardResponse(Object)
    async getUserMedia(
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: QueryMediaDto,
    ): Promise<any> {
        return this.mediaService.findByUser(user.userId, query);
    }

    @Post('upload/request')
    @ApiStandardResponse(Object)
    async requestUpload(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: RequestUploadDto,
    ) {
        return this.mediaService.requestUpload(user.userId, dto);
    }

    @Post('upload/confirm')
    @ApiStandardResponse(Object)
    async confirmUpload(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: ConfirmUploadDto,
    ): Promise<any> {
        return this.mediaService.confirmUpload(user.userId, dto);
    }

    @Post('upload/direct')
    @UseInterceptors(FileInterceptor('file'))
    @ApiStandardResponse(Object)
    async directUpload(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: DirectUploadDto,
        @UploadedFile() file: any,
    ): Promise<any> {
        return this.mediaService.directUpload(user.userId, dto, file);
    }

    @Get(['storage/stats', 'storage-usage', 'stats'])
    @ApiStandardResponse(Object)
    async getStorageStats(@CurrentUser() user: AuthenticatedUser) {
        return this.mediaService.getStorageStats(user.userId);
    }

    @Get(':id')
    @ApiStandardResponse(Object)
    async getMediaDetails(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
    ): Promise<any> {
        return this.mediaService.findById(id, user.userId);
    }

    @Patch([':id', ':id/metadata'])
    @ApiStandardResponse(Object)
    async updateMetadata(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
        @Body() dto: UpdateMediaMetadataDto,
    ): Promise<any> {
        return this.mediaService.updateMetadata(id, user.userId, dto);
    }

    @Delete(':id')
    @ApiStandardResponse(Object)
    async deleteMedia(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
    ): Promise<any> {
        return this.mediaService.delete(id, user.userId);
    }

    @Get(':id/download')
    @ApiStandardResponse(Object)
    async getDownloadUrl(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
    ) {
        return this.mediaService.getDownloadUrl(id, user.userId);
    }

    @Post(':id/copy')
    @ApiStandardResponse(Object)
    async copyMedia(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
        @Body() body: { destinationFolderId?: string },
    ) {
        // TODO: Copy media
        return { id: `copied_${id}`, originalId: id, destination: body.destinationFolderId };
    }

    @Post(':id/move')
    @ApiStandardResponse(Object)
    async moveMedia(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
        @Body() body: { destinationFolderId: string },
    ) {
        // TODO: Move media
        return { id, movedTo: body.destinationFolderId };
    }

    @Post(':id/regenerate-thumbnail')
    @ApiStandardResponse(Object)
    async regenerateThumbnail(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
    ) {
        return { id, thumbnailGenerated: true };
    }

    @Get(':id/versions')
    @ApiStandardResponse(Object)
    async getVersions(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
    ) {
        return { id, versions: [] };
    }
}
