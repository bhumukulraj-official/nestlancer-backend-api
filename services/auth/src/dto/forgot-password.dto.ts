import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, ValidateIf } from 'class-validator';
import { Trim } from '@nestlancer/common';

/**
 * Data required to initiate a secure password recovery flow.
 */
export class ForgotPasswordDto {
    @ApiProperty({ example: 'user@example.com', description: 'The registered primary email address for the account' })
    @IsEmail()
    @Trim()
    email: string;

    @ApiProperty({
        description: 'Cloudflare Turnstile token for client-side bot protection verification.',
        example: '0.xtoken...'
    })
    @IsString()
    @ValidateIf((o) => process.env.NODE_ENV !== 'test')
    turnstileToken: string;
}

