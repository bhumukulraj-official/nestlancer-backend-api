import { IsString, IsNotEmpty, IsNumber, Min, IsArray, ValidateNested, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Individual line item within a project quote.
 */
class QuoteItemDto {
    @ApiProperty({ description: 'Detailed description of the service or component', example: 'Frontend UI Implementation - Dashboard' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ description: 'Quantity or hours for the item', example: 1, minimum: 0 })
    @IsNumber()
    @Min(0)
    quantity: number;

    @ApiProperty({ description: 'Price per unit or hour', example: 2500, minimum: 0 })
    @IsNumber()
    @Min(0)
    unitPrice: number;
}

/**
 * DTO for generating a formal quote based on a client request.
 */
export class CreateQuoteDto {
    @ApiProperty({ description: 'List of line items comprising the quote total', type: [QuoteItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuoteItemDto)
    items: QuoteItemDto[];

    @ApiProperty({ description: 'ISO currency code for the quote', example: 'USD', maxLength: 3 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(3)
    currency: string;

    @ApiProperty({ description: 'Tax percentage to apply to the subtotal', example: 10, minimum: 0 })
    @IsNumber()
    @Min(0)
    taxPercentage: number;

    @ApiProperty({ description: 'Quote expiration date', example: '2024-12-31T23:59:59Z' })
    @IsString()
    @IsNotEmpty()
    validUntil: string; // ISO date string

    @ApiPropertyOptional({
        description: 'Legal terms and conditions governing this specific quote',
        example: 'Payment due within 15 days of milestone completion.',
        maxLength: 2000
    })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    termsAndConditions?: string;

    @ApiPropertyOptional({
        description: 'Internal administrative or project management notes',
        example: 'Priority client. Standard rates applied.',
        maxLength: 1000
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    internalNotes?: string;
}

