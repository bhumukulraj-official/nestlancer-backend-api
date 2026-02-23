import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmPaymentDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    paymentIntentId: string; // Razorpay Order ID

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    externalPaymentId: string; // Razorpay Payment ID

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    signature: string; // Razorpay Signature for verification
}
