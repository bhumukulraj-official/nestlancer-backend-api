import { IsUUID, IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadDeliverableDto {
    @ApiProperty()
    @IsUUID()
    milestoneId: string;

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsUUID('4', { each: true })
    mediaIds: string[];

    @ApiPropertyOptional({ maxLength: 1000 })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;
}
