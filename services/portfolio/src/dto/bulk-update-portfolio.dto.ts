import { IsEnum, IsArray, IsString } from 'class-validator';

export enum BulkOperation {
    PUBLISH = 'PUBLISH',
    ARCHIVE = 'ARCHIVE',
    DELETE = 'DELETE',
    FEATURE = 'FEATURE',
    UNFEATURE = 'UNFEATURE',
}

export class BulkUpdatePortfolioDto {
    @IsEnum(BulkOperation)
    operation: BulkOperation;

    @IsArray()
    @IsString({ each: true })
    ids: string[];
}
