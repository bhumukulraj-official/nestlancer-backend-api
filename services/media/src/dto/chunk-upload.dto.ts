import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

/**
 * Data Transfer Object for initializing a multipart/chunked upload.
 */
export class InitChunkUploadDto {
    @ApiProperty({ example: 'large-video.mp4', description: 'Original filename' })
    @IsString()
    filename: string;

    @ApiProperty({ example: 'video/mp4', description: 'MIME type' })
    @IsString()
    mimeType: string;

    @ApiProperty({ example: 524288000, description: 'Total file size in bytes' })
    @IsNumber()
    totalSize: number;
}

/**
 * Data Transfer Object for uploading an individual file chunk.
 */
export class UploadChunkDto {
    @ApiProperty({ description: 'The unique ID assigned during initialization' })
    @IsString()
    uploadId: string;

    @ApiProperty({ example: 1, description: 'The sequential part number (1-indexed)' })
    @IsNumber()
    partNumber: number;
}

/**
 * Data Transfer Object for finalising a chunked upload.
 */
export class CompleteChunkUploadDto {
    @ApiProperty({ description: 'The unique ID assigned during initialization' })
    @IsString()
    uploadId: string;
}
