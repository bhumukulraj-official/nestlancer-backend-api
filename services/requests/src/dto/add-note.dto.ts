import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { Trim } from '@nestlancer/common/decorators/trim.decorator';

export class AddNoteDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    @Trim()
    content: string;
}
