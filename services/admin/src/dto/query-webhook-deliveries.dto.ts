import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@nestlancer/common/dto/pagination-query.dto';

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
