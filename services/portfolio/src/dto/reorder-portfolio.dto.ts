import { IsArray, ValidateNested, IsUUID, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ReorderItemDto {
    @IsUUID('4')
    id: string;

    @IsInt()
    order: number;
}

export class ReorderPortfolioDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReorderItemDto)
    items: ReorderItemDto[];
}
