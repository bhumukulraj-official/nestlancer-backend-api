import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { Period } from './dashboard-query.dto';

export class RevenueQueryDto {
    @IsOptional()
    @IsEnum(Period)
    period?: Period;

    @IsOptional()
    @IsDateString()
    from?: string;

    @IsOptional()
    @IsDateString()
    to?: string;
}
