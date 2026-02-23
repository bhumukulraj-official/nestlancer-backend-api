import { IsEmail, IsString, MinLength, MaxLength, Matches, IsBoolean, IsOptional, ValidateIf } from 'class-validator';
import { Trim } from '@nestlancer/common/decorators/trim.decorator';

export class RegisterDto {
    @IsEmail()
    @Trim()
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(64)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password must contain uppercase, lowercase, number, and special character',
    })
    password: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @Trim()
    firstName: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @Trim()
    lastName: string;

    @IsOptional()
    @IsString()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Phone number must be a valid E.164 format',
    })
    phone?: string;

    @IsBoolean()
    acceptTerms: boolean;

    @IsOptional()
    @IsBoolean()
    marketingConsent?: boolean;

    @IsString()
    @ValidateIf((o) => process.env.NODE_ENV !== 'test') // Optional in test env
    turnstileToken: string;
}
