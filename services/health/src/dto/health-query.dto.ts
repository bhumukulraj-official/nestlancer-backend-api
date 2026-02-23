import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class HealthQueryDto {
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    refresh?: boolean;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    verbose?: boolean;
}
