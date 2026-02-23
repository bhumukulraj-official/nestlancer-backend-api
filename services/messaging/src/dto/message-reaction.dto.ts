import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MessageReactionDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    emoji: string;
}
