import { IsEmail, IsString, IsBoolean, IsOptional } from 'class-validator';
import { Trim } from '@nestlancer/common/decorators/trim.decorator';

export class LoginDto {
    @IsEmail()
    @Trim()
    email: string;

    @IsString()
    password: string;

    @IsOptional()
    @IsBoolean()
    rememberMe?: boolean;
}
