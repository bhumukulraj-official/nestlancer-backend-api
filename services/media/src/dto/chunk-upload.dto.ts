import { IsString, IsNumber } from 'class-validator';

export class InitChunkUploadDto {
    @IsString()
    filename: string;

    @IsString()
    mimeType: string;

    @IsNumber()
    totalSize: number;
}

export class UploadChunkDto {
    @IsString()
    uploadId: string;

    @IsNumber()
    partNumber: number;
}

export class CompleteChunkUploadDto {
    @IsString()
    uploadId: string;
}
