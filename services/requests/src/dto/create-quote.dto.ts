import { IsString, IsNotEmpty, IsNumber, Min, IsArray, ValidateNested, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

class QuoteItemDto {
    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @Min(0)
    quantity: number;

    @IsNumber()
    @Min(0)
    unitPrice: number;
}

export class CreateQuoteDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuoteItemDto)
    items: QuoteItemDto[];

    @IsString()
    @IsNotEmpty()
    @MaxLength(3)
    currency: string;

    @IsNumber()
    @Min(0)
    taxPercentage: number;

    @IsString()
    @IsNotEmpty()
    validUntil: string; // ISO date string

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    termsAndConditions?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    internalNotes?: string;
}
