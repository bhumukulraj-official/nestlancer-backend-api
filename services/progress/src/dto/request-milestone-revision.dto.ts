import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestMilestoneRevisionDto {
    @ApiProperty({ maxLength: 2000 })
    @IsString()
    @MaxLength(2000)
    reason: string;
}
