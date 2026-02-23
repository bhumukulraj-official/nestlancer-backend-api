import { IsString, IsNotEmpty, IsNumber, Min, IsArray, ValidateNested, IsOptional, MaxLength, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class QuotePaymentBreakdownDto {
    @IsString()
    @IsIn(['advance', 'milestone', 'final', 'subscription', 'fullPayment'])
    type: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @Min(0)
    amount: number;

    @IsNumber()
    @Min(0)
    percentage: number;

    @IsString()
    dueDate: string; // ISO Date

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    deliverables?: string[];
}

export class CreateQuoteAdminDto {
    @IsString()
    @IsNotEmpty()
    requestId: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    description: string;

    @IsNumber()
    @Min(0)
    totalAmount: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(3)
    currency: string;

    @IsString()
    @IsNotEmpty()
    validUntil: string; // ISO date

    @IsNumber()
    @Min(1)
    validityDays: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuotePaymentBreakdownDto)
    paymentBreakdown: QuotePaymentBreakdownDto[];

    @IsOptional()
    timeline?: any;

    @IsOptional()
    scope?: any;

    @IsOptional()
    technicalDetails?: any;

    @IsOptional()
    @IsString()
    terms?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    attachments?: string[];
}
