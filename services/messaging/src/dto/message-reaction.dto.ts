import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for adding or removing a reaction from a message.
 */
export class MessageReactionDto {
    @ApiProperty({ example: '👍', description: 'The emoji character' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    emoji: string;
}
