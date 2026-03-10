import { IsString, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for creating a notification template.
 */
export class CreateNotificationTemplateDto {
  @ApiProperty({ example: 'welcome_email', description: 'Unique name identifier for the template' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'USER_REGISTERED',
    description: 'The event type that triggers this template',
  })
  @IsEnum(String)
  eventType: string; // NotificationEventType

  @ApiProperty({ description: 'Configuration for different delivery channels (email, push, etc.)' })
  @IsObject()
  channels: Record<string, any>;
}
