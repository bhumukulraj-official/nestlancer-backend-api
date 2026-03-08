import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Controller for enabling or disabling specific system feature flags.
 */
export class ToggleFeatureDto {
    @ApiProperty({ description: 'Target state for the feature flag', example: true })
    @IsBoolean()
    enabled: boolean;
}

