import { IsBoolean, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class ToggleMaintenanceDto {
    @IsBoolean()
    enabled: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    message?: string;

    @IsOptional()
    @IsDateString()
    estimatedEnd?: string;
}
