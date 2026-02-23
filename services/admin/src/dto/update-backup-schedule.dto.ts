import { IsInt, IsString, Max, Min } from 'class-validator';

export class UpdateBackupScheduleDto {
    @IsString()
    cronExpression: string;

    @IsInt()
    @Min(1)
    @Max(90)
    retentionDays: number;
}
