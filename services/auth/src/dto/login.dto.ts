import { IsEmail, IsString, IsBoolean, IsOptional } from 'class-validator';
import { Trim } from '@nestlancer/common';

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
