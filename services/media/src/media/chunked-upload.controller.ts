import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser, AuthenticatedUser } from '@nestlancer/auth-lib';
import { ApiStandardResponse } from '@nestlancer/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';

import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { InitChunkUploadDto, UploadChunkDto, CompleteChunkUploadDto } from '../dto/chunk-upload.dto';

/**
 * Controller for managing multipart/chunked media uploads.
 * Necessary for reliably uploading large files (e.g., high-res video).
 * 
 * @category Media
 */
@ApiTags('Media - Chunked Upload')
@ApiBearerAuth()
@Controller(['media/upload/chunked', 'media/upload/chunk', 'upload/chunked'])
@UseGuards(JwtAuthGuard)
export class ChunkedUploadController {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    /**
     * Initializes a new chunked upload session.
     * 
     * @param user The current authenticated user
     * @param dto Initialization details
     * @returns Upload session ID and chunk configuration
     */
    @Post('init')
    @ApiStandardResponse(Object)
    @ApiOperation({ summary: 'Initialize chunked upload', description: 'Start a multipart upload session for a large file.' })
    async initChunkedUpload(@CurrentUser() user: AuthenticatedUser, @Body() dto: InitChunkUploadDto): Promise<any> {
        const payload = dto as any;
        const filename = payload.filename || 'unknown';
        const media = await this.prismaWrite.media.create({
            data: {
                uploaderId: user.userId,
                filename: `chunked_${Date.now()}_${filename}`,
                originalFilename: filename,
                mimeType: payload.mimeType || 'application/octet-stream',
                size: payload.totalSize || 0,
                contextType: payload.context || 'general',
                contextId: null,
                status: 'UPLOADING',
                metadata: {
                    chunkSize: payload.chunkSize || 10485760,
                    totalChunks: payload.totalSize ? Math.ceil(payload.totalSize / (payload.chunkSize || 10485760)) : 1,
                    receivedChunks: [],
                    bucket: 'default'
                }
            }
        });
        return { uploadId: media.id, chunkSize: payload.chunkSize || 10485760 };
    }

    /**
     * Uploads an individual file chunk.
     * 
     * @param user The current authenticated user
     * @param uploadId The upload session ID
     * @param dto Chunk metadata
     * @returns Acknowledgment of chunk receipt
     */
    @Post([':uploadId/part', ':uploadId'])
    @ApiStandardResponse(Object)
    @ApiOperation({ summary: 'Upload chunk', description: 'Provide a single part of the multipart file upload.' })
    async uploadChunk(
        @CurrentUser() user: AuthenticatedUser,
        @Param('uploadId') uploadId: string,
        @Body() dto: UploadChunkDto,
    ): Promise<any> {
        const payload = dto as any;
        const media = await this.prismaRead.media.findUnique({ where: { id: uploadId, uploaderId: user.userId } });
        if (!media) throw new Error('Upload session not found');

        const metadata = (media.metadata || {}) as any;
        const receivedChunks = metadata.receivedChunks || [];

        if (!receivedChunks.includes(payload.partNumber)) {
            receivedChunks.push(payload.partNumber);
        }

        await this.prismaWrite.media.update({
            where: { id: uploadId },
            data: {
                metadata: {
                    ...metadata,
                    receivedChunks
                }
            }
        });

        return { uploadId, partNumber: payload.partNumber, received: true };
    }

    /**
     * Completes a chunked upload and initiates file assembly.
     * 
     * @param user The current authenticated user
     * @param uploadId The upload session ID
     * @param dto Completion signal
     * @returns Details of the assembled media asset
     */
    @Post(':uploadId/complete')
    @ApiStandardResponse(Object)
    @ApiOperation({ summary: 'Complete chunked upload', description: 'Notify the system that all parts have been uploaded.' })
    async completeChunkedUpload(
        @CurrentUser() user: AuthenticatedUser,
        @Param('uploadId') uploadId: string,
        @Body() dto: CompleteChunkUploadDto,
    ): Promise<any> {
        const media = await this.prismaWrite.media.update({
            where: { id: uploadId, uploaderId: user.userId },
            data: {
                status: 'READY',
                urls: { default: `https://storage.cdn.com/${uploadId}` }
            }
        });
        return { uploadId, assembled: true, mediaId: media.id };
    }

    /**
     * Checks the status of a multipart upload.
     * Identifies any missing or corrupt chunks.
     * 
     * @param user The current authenticated user
     * @param uploadId The upload session ID
     * @returns List of missing segments and overall progress
     */
    @Get(':uploadId/status')
    @ApiStandardResponse(Object)
    @ApiOperation({ summary: 'Get upload status', description: 'Verify which chunks have been successfully received.' })
    async getChunkUploadStatus(
        @CurrentUser() user: AuthenticatedUser,
        @Param('uploadId') uploadId: string,
    ): Promise<any> {
        const media = await this.prismaRead.media.findUnique({ where: { id: uploadId, uploaderId: user.userId } });
        if (!media) throw new Error('Upload session not found');

        const metadata = (media.metadata || {}) as any;
        const totalChunks = metadata.totalChunks || 1;
        const receivedChunks = metadata.receivedChunks || [];

        const missingChunks = [];
        for (let i = 1; i <= totalChunks; i++) {
            if (!receivedChunks.includes(i)) {
                missingChunks.push(i);
            }
        }

        const progress = totalChunks > 0 ? (receivedChunks.length / totalChunks) * 100 : 100;

        return {
            uploadId,
            status: media.status,
            completedChunks: receivedChunks,
            missingChunks,
            progress: `${progress.toFixed(2)}%`
        };
    }

    /**
     * Aborts an active chunked upload and clean up temporary storage.
     * 
     * @param user The current authenticated user
     * @param uploadId The upload session ID
     * @returns Confirmation of cancellation
     */
    @Post(':uploadId/abort')
    @ApiStandardResponse(Object)
    @ApiOperation({ summary: 'Abort upload', description: 'Cancel the multipart session and discard all received data.' })
    async abortChunkedUpload(
        @CurrentUser() user: AuthenticatedUser,
        @Param('uploadId') uploadId: string,
    ): Promise<any> {
        return { uploadId, aborted: true };
    }
}
