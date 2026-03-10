import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Administrative DTO for reassigning user access levels.
 */
export class AdminChangeRoleDto {
  @ApiProperty({
    description: 'The target system role to assign to the user',
    example: 'MODERATOR',
  })
  @IsString()
  @IsNotEmpty()
  role: string;
}
