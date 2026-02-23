import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug',
}

export class QueryLogsDto {
    @IsOptional()
    @IsEnum(LogLevel)
    level?: LogLevel;

    @IsOptional()
    @IsString()
    service?: string;

    @IsOptional()
    @IsDateString()
    from?: string;

    @IsOptional()
    @IsDateString()
    to?: string;
}
