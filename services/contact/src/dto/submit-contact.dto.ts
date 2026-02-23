import { ContactSubject, Trim } from '@nestlancer/common';
import { IsString, IsEmail, MaxLength, MinLength, IsEnum } from 'class-validator';

export class SubmitContactDto {
    @IsString()
    @Trim()
    @MaxLength(100)
    name: string;

    @IsEmail()
    @Trim()
    email: string;

    @IsEnum(ContactSubject)
    subject: ContactSubject;

    @IsString()
    @Trim()
    @MinLength(10)
    @MaxLength(5000)
    message: string;

    @IsString()
    turnstileToken: string;
}
