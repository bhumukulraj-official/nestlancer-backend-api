import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '@nestlancer/common/dto/pagination-query.dto';

export class QueryAuditDto extends PaginationQueryDto {
    @IsOptional()
    @IsUUID('4')
    userId?: string;

    @IsOptional()
    @IsString()
    resourceType?: string;

    @IsOptional()
    @IsString()
    action?: string;

    @IsOptional()
    @IsDateString()
    from?: string;

    @IsOptional()
    @IsDateString()
    to?: string;
}
