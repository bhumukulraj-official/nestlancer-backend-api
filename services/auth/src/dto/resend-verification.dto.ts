import { IsEmail } from 'class-validator';
import { Trim } from '@nestlancer/common';

export class ResendVerificationDto {
    @IsEmail()
    @Trim()
    email: string;
}
