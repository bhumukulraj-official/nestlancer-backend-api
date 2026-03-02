import { IsString, IsOptional, MaxLength, MinLength, Matches } from 'class-validator';
import { Trim } from '@nestlancer/common';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @Trim()
    firstName?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @Trim()
    lastName?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone number must be a valid E.164 format' })
    phone?: string;

    @IsOptional()
    @IsString()
    timezone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2)
    language?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2)
    country?: string;
}
