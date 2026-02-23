import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    milestoneId?: string;

    @ApiProperty()
    @IsNumber()
    @Min(1)
    amount: number;

    @ApiPropertyOptional({ default: 'INR' })
    @IsOptional()
    @IsString()
    @MaxLength(3)
    currency?: string = 'INR';

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    paymentMethodId?: string;
}
