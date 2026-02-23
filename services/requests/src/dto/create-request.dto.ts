import { IsString, IsNotEmpty, IsOptional, MaxLength, MinLength, IsIn, ValidateNested, IsNumber, Min, IsBoolean, IsArray, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { Trim } from '@nestlancer/common/decorators/trim.decorator';

class BudgetDto {
    @IsNumber()
    @Min(0)
    min: number;

    @IsNumber()
    @Min(0)
    max: number;

    @IsString()
    @MaxLength(3)
    currency: string;

    @IsBoolean()
    flexible: boolean;
}

class TimelineDto {
    @IsString()
    @IsNotEmpty()
    preferredStartDate: string; // ISO Date string

    @IsString()
    @IsNotEmpty()
    deadline: string; // ISO Date string

    @IsBoolean()
    flexible: boolean;
}

class TechnicalRequirementsDto {
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    preferredTechnologies?: string[];

    @IsString()
    @IsOptional()
    hosting?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    integrations?: string[];
}

export class CreateRequestDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(100)
    @Trim()
    title: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(20)
    @MaxLength(5000)
    @Trim()
    description: string;

    @IsString()
    @IsIn([
        'webDevelopment', 'mobileApp', 'ecommerce', 'design',
        'branding', 'marketing', 'seo', 'consulting', 'maintenance', 'custom'
    ])
    category: string;

    @ValidateNested()
    @Type(() => BudgetDto)
    budget: BudgetDto;

    @ValidateNested()
    @Type(() => TimelineDto)
    timeline: TimelineDto;

    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(20)
    requirements: string[];

    @IsOptional()
    @ValidateNested()
    @Type(() => TechnicalRequirementsDto)
    technicalRequirements?: TechnicalRequirementsDto;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(10)
    attachments?: string[];

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    @Trim()
    additionalInfo?: string;
}
