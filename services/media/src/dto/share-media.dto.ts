import { IsOptional, IsNumber, IsBoolean, IsArray, IsEmail, IsString } from 'class-validator';

export class ShareMediaDto {
    @IsOptional()
    @IsNumber()
    expiresInSeconds?: number;

    @IsOptional()
    @IsBoolean()
    passwordProtected?: boolean;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsArray()
    @IsEmail({}, { each: true })
    allowedEmails?: string[];
}
