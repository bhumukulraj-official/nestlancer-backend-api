import { IsString, IsNotEmpty, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class AcceptQuoteDto {
    @IsBoolean()
    acceptTerms: boolean;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    signatureName: string;

    @IsString()
    @IsNotEmpty()
    signatureDate: string; // ISO date string

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    notes?: string;
}
