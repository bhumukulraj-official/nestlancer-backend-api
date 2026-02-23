import { IsString, MaxLength, IsOptional, IsBoolean } from 'class-validator';
import { Trim } from '@nestlancer/common';

export class RespondContactDto {
    @IsString()
    @Trim()
    @MaxLength(200)
    subject: string;

    @IsString()
    @Trim()
    @MaxLength(10000)
    message: string;

    @IsOptional()
    @IsBoolean()
    markAsResponded?: boolean = true;
}
