import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum AnnouncementType {
    INFO = 'INFO',
    WARNING = 'WARNING',
    CRITICAL = 'CRITICAL',
}

export class SendAnnouncementDto {
    @IsString()
    @MaxLength(200)
    title: string;

    @IsString()
    @MaxLength(1000)
    message: string;

    @IsEnum(AnnouncementType)
    type: AnnouncementType;

    @IsOptional()
    @IsBoolean()
    dismissable?: boolean;

    @IsOptional()
    @IsDateString()
    scheduledFor?: string;

    @IsOptional()
    @IsDateString()
    expiresAt?: string;
}
