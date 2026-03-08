import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, ValidateNested, IsString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Preferences for specific delivery channels.
 */
export class ChannelPreferencesDto {
    @ApiProperty({ example: true, description: 'Enable/disable email notifications' })
    @IsBoolean()
    email: boolean;

    @ApiProperty({ example: true, description: 'Enable/disable push notifications' })
    @IsBoolean()
    push: boolean;

    @ApiProperty({ example: true, description: 'Enable/disable in-app notifications' })
    @IsBoolean()
    inApp: boolean;
}

/**
 * Configuration for quiet hours to suppress notifications.
 */
export class QuietHoursDto {
    @ApiProperty({ example: '22:00', description: 'Start time of quiet hours (HH:mm)' })
    @IsString()
    start: string;

    @ApiProperty({ example: '08:00', description: 'End time of quiet hours (HH:mm)' })
    @IsString()
    end: string;

    @ApiProperty({ example: 'UTC', description: 'Timezone for quiet hours' })
    @IsString()
    timezone: string;
}

/**
 * Data Transfer Object for updating notification preferences.
 */
export class UpdatePreferencesDto {
    @ApiPropertyOptional({
        description: 'Map of category names to channel preferences',
        additionalProperties: { type: 'object', $ref: '#/components/schemas/ChannelPreferencesDto' }
    })
    @IsOptional()
    @IsObject()
    @ValidateNested({ each: true })
    @Type(() => ChannelPreferencesDto)
    preferences?: Record<string, ChannelPreferencesDto>;

    @ApiPropertyOptional({ description: 'Quiet hours settings' })
    @IsOptional()
    @ValidateNested()
    @Type(() => QuietHoursDto)
    quietHours?: QuietHoursDto;
}
