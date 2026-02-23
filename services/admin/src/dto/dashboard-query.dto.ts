import { IsEnum, IsOptional } from 'class-validator';

export enum Period {
    TODAY = 'TODAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
    QUARTER = 'QUARTER',
    YEAR = 'YEAR',
}

export class DashboardQueryDto {
    @IsOptional()
    @IsEnum(Period)
    period?: Period;
}
