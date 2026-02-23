import { IsEmail } from 'class-validator';
import { Trim } from '@nestlancer/common/decorators/trim.decorator';

export class ResendVerificationDto {
    @IsEmail()
    @Trim()
    email: string;
}
