import { IsString, IsOptional, IsEnum } from 'class-validator';
import { FileType } from '../interfaces/media.interface';

export class DirectUploadDto {
    @IsEnum(FileType)
    fileType: FileType;

    @IsOptional()
    @IsString()
    projectId?: string;

    @IsOptional()
    @IsString()
    messageId?: string;
}
