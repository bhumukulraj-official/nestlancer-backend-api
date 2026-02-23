import { IsString, IsNumber, IsOptional, Max, Min, IsEnum } from 'class-validator';
import { MAX_FILE_SIZES, FileType } from '../interfaces/media.interface';

export class RequestUploadDto {
    @IsString()
    filename: string;

    @IsString()
    mimeType: string;

    @IsNumber()
    @Min(1)
    @Max(MAX_FILE_SIZES.video) // absolute max across all types
    size: number;

    @IsEnum(FileType)
    fileType: FileType;

    @IsOptional()
    @IsString()
    projectId?: string;

    @IsOptional()
    @IsString()
    messageId?: string;
}
