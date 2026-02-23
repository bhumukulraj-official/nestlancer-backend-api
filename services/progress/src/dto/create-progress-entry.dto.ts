import { IsEnum, IsString, MaxLength, IsOptional, IsUUID, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProgressEntryType, Visibility } from '../interfaces/progress.interface';

export class CreateProgressEntryDto {
    @ApiProperty({ enum: ProgressEntryType })
    @IsEnum(ProgressEntryType)
    type: ProgressEntryType;

    @ApiProperty({ maxLength: 200 })
    @IsString()
    @MaxLength(200)
    title: string;

    @ApiProperty({ maxLength: 5000 })
    @IsString()
    @MaxLength(5000)
    description: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    milestoneId?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    deliverableIds?: string[];

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    attachmentIds?: string[];

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    notifyClient?: boolean = true;

    @ApiPropertyOptional({ enum: Visibility, default: Visibility.CLIENT_VISIBLE })
    @IsOptional()
    @IsEnum(Visibility)
    visibility?: Visibility = Visibility.CLIENT_VISIBLE;
}
