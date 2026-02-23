import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum JobStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export class QueryJobsDto {
    @IsOptional()
    @IsEnum(JobStatus)
    status?: JobStatus;

    @IsOptional()
    @IsString()
    queue?: string;
}
