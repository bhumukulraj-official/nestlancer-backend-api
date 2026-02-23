import { IsString, IsNotEmpty, IsOptional, MaxLength, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '../interfaces/messaging.interface';

export class CreateMessageDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    content?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    replyToId?: string;

    @ApiPropertyOptional({ enum: MessageType, default: MessageType.TEXT })
    @IsOptional()
    @IsEnum(MessageType)
    type?: MessageType = MessageType.TEXT;

    // Potential fields for attachments could be added later
    // @IsOptional() @IsArray() attachmentIds?: string[];
}
