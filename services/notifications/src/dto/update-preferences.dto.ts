import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, ValidateNested, IsString, IsObject } from 'class-validator';

export class ChannelPreferencesDto {
    @IsBoolean()
    email: boolean;

    @IsBoolean()
    push: boolean;

    @IsBoolean()
    inApp: boolean;
}

export class QuietHoursDto {
    @IsString()
    start: string;

    @IsString()
    end: string;

    @IsString()
    timezone: string;
}

export class UpdatePreferencesDto {
    @IsOptional()
    @IsObject()
    @ValidateNested({ each: true })
    @Type(() => ChannelPreferencesDto)
    preferences?: Record<string, ChannelPreferencesDto>;

    @IsOptional()
    @ValidateNested()
    @Type(() => QuietHoursDto)
    quietHours?: QuietHoursDto;
}
