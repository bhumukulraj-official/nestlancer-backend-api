import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data Transfer Object for marking a notification as read or unread.
 */
export class MarkReadDto {
    @ApiPropertyOptional({ example: true, default: true, description: 'The read status to set' })
    @IsOptional()
    @IsBoolean()
    read?: boolean = true;
}
