import { IsEnum, IsArray, IsUUID } from 'class-validator';

export enum BulkOperation {
    PUBLISH = 'PUBLISH',
    ARCHIVE = 'ARCHIVE',
    DELETE = 'DELETE',
}

export class BulkUpdatePortfolioDto {
    @IsEnum(BulkOperation)
    operation: BulkOperation;

    @IsArray()
    @IsUUID('4', { each: true })
    ids: string[];
}
