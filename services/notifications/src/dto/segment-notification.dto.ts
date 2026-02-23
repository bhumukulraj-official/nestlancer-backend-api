import { IsOptional, IsString, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class SegmentCriteriaDto {
    @IsOptional()
    @IsString()
    role?: string;

    @IsOptional()
    @IsObject()
    dateRange?: { start?: string; end?: string };

    @IsOptional()
    @IsString()
    activity?: string;
}

export class SegmentNotificationDto {
    @ValidateNested()
    @Type(() => SegmentCriteriaDto)
    criteria: SegmentCriteriaDto;

    @IsObject()
    notificationPayload: any;
}
