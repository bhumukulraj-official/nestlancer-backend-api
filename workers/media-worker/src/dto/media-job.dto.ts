import { IsString, IsEnum, IsUUID, IsNotEmpty } from 'class-validator';
import { MediaContext, MediaJobType } from '../interfaces/media-job.interface';

export class ProcessMediaDto {
    @IsEnum(MediaJobType)
    @IsNotEmpty()
    type: MediaJobType;

    @IsUUID()
    @IsNotEmpty()
    mediaId: string;

    @IsString()
    @IsNotEmpty()
    s3Key: string;

    @IsString()
    @IsNotEmpty()
    contentType: string;

    @IsEnum(MediaContext)
    @IsNotEmpty()
    context: MediaContext;

    @IsUUID()
    @IsNotEmpty()
    userId: string;
}
