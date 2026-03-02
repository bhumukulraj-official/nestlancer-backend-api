import { IsEmail, IsString, ValidateIf } from 'class-validator';
import { Trim } from '@nestlancer/common';

export class ForgotPasswordDto {
    @IsEmail()
    @Trim()
    email: string;

    @IsString()
    @ValidateIf((o) => process.env.NODE_ENV !== 'test')
    turnstileToken: string;
}
