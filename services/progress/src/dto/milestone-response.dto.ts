import { MilestoneStatus } from '../interfaces/milestone.interface';
import { DeliverableResponseDto } from './deliverable-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class MilestoneResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty({ enum: MilestoneStatus })
    status: MilestoneStatus;

    @ApiProperty()
    startDate: Date;

    @ApiProperty()
    endDate: Date;

    @ApiProperty()
    completionPercentage: number;

    @ApiProperty({ type: [DeliverableResponseDto] })
    deliverables: DeliverableResponseDto[];

    @ApiProperty({ required: false })
    approvedAt?: Date;

    @ApiProperty()
    order: number;
}
