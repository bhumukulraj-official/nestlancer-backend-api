import { IsEnum, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';

export enum ExportFormat {
    CSV = 'CSV',
    JSON = 'JSON',
}

export class ExportAuditDto {
    @IsEnum(ExportFormat)
    format: ExportFormat;

    @IsOptional()
    @IsUUID('4')
    userId?: string;

    @IsOptional()
    @IsString()
    resourceType?: string;

    @IsOptional()
    @IsString()
    action?: string;

    @IsOptional()
    @IsDateString()
    from?: string;

    @IsOptional()
    @IsDateString()
    to?: string;
}
