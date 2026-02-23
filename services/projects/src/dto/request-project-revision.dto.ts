import { IsString, IsNotEmpty, IsArray, IsOptional, MaxLength, IsIn } from 'class-validator';

export class RequestProjectRevisionDto {
    @IsString()
    @IsNotEmpty()
    area: string;

    @IsString()
    @IsIn(['low', 'medium', 'high', 'critical'])
    priority: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    description: string;

    @IsArray()
    @IsString({ each: true })
    details: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    attachments?: string[];

    @IsOptional()
    @IsString()
    dueDate?: string; // ISO date
}
