import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '@nestlancer/common';
import { NotificationType } from '../interfaces/notification.interface';

export class QueryNotificationsDto extends PaginationQueryDto {
    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    unreadOnly?: boolean;
}
