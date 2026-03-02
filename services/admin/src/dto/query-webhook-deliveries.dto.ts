import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@nestlancer/common';

export enum DeliveryStatus {
    PENDING = 'PENDING',
    DELIVERED = 'DELIVERED',
    FAILED = 'FAILED',
}

export class QueryWebhookDeliveriesDto extends PaginationQueryDto {
    @IsOptional()
    @IsEnum(DeliveryStatus)
    status?: DeliveryStatus;
}
