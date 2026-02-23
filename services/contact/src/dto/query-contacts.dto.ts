import { PaginationQueryDto, ContactStatus, SortOrder } from '@nestlancer/common';
import { IsOptional, IsEnum, IsString } from 'class-validator';

export class QueryContactsDto extends PaginationQueryDto {
    @IsOptional()
    @IsEnum(ContactStatus)
    status?: ContactStatus;

    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsEnum(SortOrder)
    order?: SortOrder = SortOrder.DESC;
}
