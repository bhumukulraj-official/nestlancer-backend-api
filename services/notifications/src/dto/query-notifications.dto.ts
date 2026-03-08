import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '@nestlancer/common';
import { NotificationType } from '../interfaces/notification.interface';

/**
 * Data Transfer Object for querying user notifications.
 */
export class QueryNotificationsDto extends PaginationQueryDto {
    @ApiPropertyOptional({ enum: NotificationType, description: 'Filter by notification category' })
    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType;

    @ApiPropertyOptional({ example: true, description: 'If true, only unread notifications are returned' })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    unreadOnly?: boolean;
}
