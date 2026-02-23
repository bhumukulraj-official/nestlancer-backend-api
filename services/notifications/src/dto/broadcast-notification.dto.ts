import { IsString, IsOptional, IsArray, IsUUID, IsDateString } from 'class-validator';
import { NotificationChannel } from '../interfaces/notification.interface';

export class BroadcastNotificationDto {
    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    excludeUserIds?: string[];

    @IsOptional()
    @IsArray()
    channels?: NotificationChannel[];

    @IsOptional()
    @IsDateString()
    scheduledFor?: string;
}
