import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Data required to initiate an administrative user impersonation session.
 */
export class ImpersonateUserDto {
  @ApiProperty({
    example: 'Investigating reported UI bug in project dashboard',
    description: 'Justification for the impersonation session for auditing purposes',
  })
  @IsString()
  @MaxLength(500)
  reason: string;

  @ApiPropertyOptional({
    example: 'TICKET-1234',
    description: 'Optional support ticket ID associated with this request',
  })
  @IsOptional()
  @IsString()
  ticketId?: string;
}
