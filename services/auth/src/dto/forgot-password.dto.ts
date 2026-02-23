import { IsEmail, IsString, ValidateIf } from 'class-validator';
import { Trim } from '@nestlancer/common/decorators/trim.decorator';

export class ForgotPasswordDto {
    @IsEmail()
    @Trim()
    email: string;

    @IsString()
    @ValidateIf((o) => process.env.NODE_ENV !== 'test')
    turnstileToken: string;
}
