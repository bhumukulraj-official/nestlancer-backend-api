import { IsBoolean, IsOptional } from 'class-validator';

export class MarkReadDto {
    @IsOptional()
    @IsBoolean()
    read?: boolean = true;
}
