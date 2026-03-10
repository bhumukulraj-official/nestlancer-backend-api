import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsBoolean, IsOptional } from 'class-validator';
import { Trim } from '@nestlancer/common';

/**
 * Data required for user identity authentication.
 */
export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The registered primary email address of the account',
  })
  @IsEmail()
  @Trim()
  email: string;

  @ApiProperty({ example: 'StrongP@ssw0rd!', description: 'The user account password' })
  @IsString()
  password: string;

  @ApiPropertyOptional({
    example: true,
    description: 'If true, a long-lived refresh token will be issued for persistent sessions',
  })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
