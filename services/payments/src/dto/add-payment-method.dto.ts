import { IsString, IsOptional, IsBoolean, IsInt, IsIn, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddPaymentMethodDto {
    @ApiProperty({ enum: ['card', 'upi', 'netbanking', 'wallet'] })
    @IsString()
    @IsIn(['card', 'upi', 'netbanking', 'wallet'])
    type: 'card' | 'upi' | 'netbanking' | 'wallet';

    @ApiPropertyOptional({ description: 'Provider token for saved method' })
    @IsOptional()
    @IsString()
    tokenId?: string;

    @ApiPropertyOptional({ description: 'Last 4 digits for cards' })
    @IsOptional()
    @IsString()
    last4?: string;

    @ApiPropertyOptional({ description: 'Card brand (visa, mastercard, etc.)' })
    @IsOptional()
    @IsString()
    cardBrand?: string;

    @ApiPropertyOptional({ description: 'Card expiration month' })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(12)
    cardExpMonth?: number;

    @ApiPropertyOptional({ description: 'Card expiration year' })
    @IsOptional()
    @IsInt()
    @Min(2024)
    @Max(2050)
    cardExpYear?: number;

    @ApiPropertyOptional({ description: 'UPI VPA handle' })
    @IsOptional()
    @IsString()
    upiVpa?: string;

    @ApiPropertyOptional({ description: 'Bank name for netbanking' })
    @IsOptional()
    @IsString()
    bankName?: string;

    @ApiPropertyOptional({ description: 'Wallet provider (paytm, phonepe, etc.)' })
    @IsOptional()
    @IsString()
    walletProvider?: string;

    @ApiPropertyOptional({ description: 'User-defined nickname for the payment method' })
    @IsOptional()
    @IsString()
    nickname?: string;

    @ApiPropertyOptional({ description: 'Set as default payment method' })
    @IsOptional()
    @IsBoolean()
    setAsDefault?: boolean;
}
