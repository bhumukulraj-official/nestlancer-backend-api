import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsBoolean, IsArray, IsEmail, IsString } from 'class-validator';

/**
 * Data Transfer Object for creating a shared media link.
 */
export class ShareMediaDto {
    @ApiPropertyOptional({ example: 3600, description: 'Expirations time in seconds' })
    @IsOptional()
    @IsNumber()
    expiresInSeconds?: number;

    @ApiPropertyOptional({ example: false, description: 'Whether the link requires a password' })
    @IsOptional()
    @IsBoolean()
    passwordProtected?: boolean;

    @ApiPropertyOptional({ description: 'The password required to access the shared media' })
    @IsOptional()
    @IsString()
    password?: string;

    @ApiPropertyOptional({ example: ['user@example.com'], description: 'List of specific emails allowed to access' })
    @IsOptional()
    @IsArray()
    @IsEmail({}, { each: true })
    allowedEmails?: string[];
}
