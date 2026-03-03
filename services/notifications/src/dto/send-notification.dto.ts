import { IsArray, IsUUID, IsString, MaxLength, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { NotificationType, NotificationChannel } from '../interfaces/notification.interface';

export class SendNotificationDto {
    @IsArray()
    @IsUUID(undefined, { each: true })
    recipientIds: string[];

    @IsString()
    @MaxLength(200)
    title: string;

    @IsString()
    @MaxLength(2000)
    message: string;

    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType;

    @IsOptional()
    @IsArray()
    @IsEnum(NotificationChannel, { each: true })
    channels?: NotificationChannel[];

    @IsOptional()
    @IsDateString()
    scheduledFor?: string;
}
