import { IsString, IsNotEmpty, IsBoolean, IsOptional, MaxLength, IsIn } from 'class-validator';

export class DeclineQuoteDto {
    @IsString()
    @IsNotEmpty()
    reason: string; // e.g., 'budgetConstraints', 'timelineIssues'

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    feedback?: string;

    @IsBoolean()
    requestRevision: boolean;
}
