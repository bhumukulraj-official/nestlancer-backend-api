import { IsString, IsNotEmpty, IsOptional, MaxLength, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '../interfaces/messaging.interface';

/**
 * Data Transfer Object for creating a new message.
 */
export class CreateMessageDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'The project ID this message belongs to' })
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @ApiPropertyOptional({ example: 'Hello, how is the progress?', description: 'Text content of the message' })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    content?: string;

    @ApiPropertyOptional({ example: '660f9511-f30c-52e5-b827-557766551111', description: 'ID of the message being replied to' })
    @IsOptional()
    @IsUUID()
    replyToId?: string;

    @ApiPropertyOptional({ enum: MessageType, default: MessageType.TEXT, description: 'Type of the message' })
    @IsOptional()
    @IsEnum(MessageType)
    type?: MessageType = MessageType.TEXT;
}
