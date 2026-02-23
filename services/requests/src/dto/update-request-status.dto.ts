import { IsString, IsIn, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateRequestStatusDto {
    @IsString()
    @IsIn(['draft', 'submitted', 'underReview', 'quoted', 'accepted', 'rejected', 'convertedToProject', 'changesRequested'])
    status: string;

    @IsOptional()
    @IsString()
    @MinLength(5)
    @MaxLength(1000)
    notes?: string;
}
