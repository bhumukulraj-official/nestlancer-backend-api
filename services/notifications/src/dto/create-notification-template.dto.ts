import { IsString, IsEnum, IsObject } from 'class-validator';

export class CreateNotificationTemplateDto {
    @IsString()
    name: string;

    @IsEnum(String)
    eventType: string; // NotificationEventType

    @IsObject()
    channels: Record<string, any>;
}
