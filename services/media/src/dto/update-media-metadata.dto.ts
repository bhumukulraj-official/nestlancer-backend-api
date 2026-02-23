import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateMediaMetadataDto {
    @IsOptional()
    @IsString()
    filename?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsObject()
    customMetadata?: Record<string, string>;
}
