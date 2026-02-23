import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

class ChangeItemDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    area: string; // e.g., 'budget', 'timeline', 'features'

    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    request: string;
}

export class RequestQuoteChangesDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChangeItemDto)
    changes: ChangeItemDto[];

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    additionalNotes?: string;
}
