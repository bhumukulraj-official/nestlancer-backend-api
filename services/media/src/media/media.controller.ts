import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { RequestUploadDto } from '../dto/request-upload.dto';
import { ConfirmUploadDto } from '../dto/confirm-upload.dto';
import { DirectUploadDto } from '../dto/direct-upload.dto';
import { UpdateMediaMetadataDto } from '../dto/update-media-metadata.dto';
import { QueryMediaDto } from '../dto/query-media.dto';
import { JwtAuthGuard, CurrentUser, AuthenticatedUser } from '@nestlancer/auth-lib';
import { ApiStandardResponse } from '@nestlancer/common/decorators/api-standard-response.decorator';
import { ApiPaginatedResponse } from '@nestlancer/common/decorators/api-paginated.decorator';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Get()
    @ApiPaginatedResponse(Object)
    async getUserMedia(
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: QueryMediaDto,
    ) {
        return this.mediaService.findByUser(user.id, query);
    }

    @Post('upload/request')
    @ApiStandardResponse(Object)
    async requestUpload(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: RequestUploadDto,
    ) {
        return this.mediaService.requestUpload(user.id, dto);
    }

    @Post('upload/confirm')
    @ApiStandardResponse(Object)
    async confirmUpload(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: ConfirmUploadDto,
    ) {
        return this.mediaService.confirmUpload(user.id, dto);
    }

    @Post('upload/direct')
    @UseInterceptors(FileInterceptor('file'))
    @ApiStandardResponse(Object)
    async directUpload(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: DirectUploadDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.mediaService.directUpload(user.id, dto, file);
    }

    @Get('storage/stats')
    @ApiStandardResponse(Object)
    async getStorageStats(@CurrentUser() user: AuthenticatedUser) {
        return this.mediaService.getStorageStats(user.id);
    }

    @Get(':id')
    @ApiStandardResponse(Object)
    async getMediaDetails(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
    ) {
        return this.mediaService.findById(id, user.id);
    }

    @Patch(':id/metadata')
    @ApiStandardResponse(Object)
    async updateMetadata(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
        @Body() dto: UpdateMediaMetadataDto,
    ) {
        return this.mediaService.updateMetadata(id, user.id, dto);
    }

    @Delete(':id')
    @ApiStandardResponse(Object)
    async deleteMedia(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
    ) {
        return this.mediaService.delete(id, user.id);
    }

    @Get(':id/download')
    @ApiStandardResponse(Object)
    async getDownloadUrl(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
    ) {
        return this.mediaService.getDownloadUrl(id, user.id);
    }
}
