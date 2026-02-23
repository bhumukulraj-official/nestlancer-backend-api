import { DeliverableStatus } from '../interfaces/deliverable.interface';
import { ApiProperty } from '@nestjs/swagger';

export class DeliverableResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    milestoneId: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty({ type: [Object] })
    media: any[];

    @ApiProperty({ enum: DeliverableStatus })
    status: DeliverableStatus;

    @ApiProperty()
    version: number;

    @ApiProperty({ required: false })
    reviewStatus?: any;

    @ApiProperty()
    createdAt: Date;
}
