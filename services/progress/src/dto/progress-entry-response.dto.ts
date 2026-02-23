import { ProgressEntryType, Visibility } from '../interfaces/progress.interface';
import { ApiProperty } from '@nestjs/swagger';

export class ProgressEntryResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: ProgressEntryType })
    type: ProgressEntryType;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty({ required: false })
    milestoneId?: string;

    @ApiProperty({ type: [Object], required: false })
    attachments?: any[];

    @ApiProperty({ enum: Visibility })
    visibility: Visibility;

    @ApiProperty()
    createdBy: string;

    @ApiProperty()
    createdAt: Date;
}
