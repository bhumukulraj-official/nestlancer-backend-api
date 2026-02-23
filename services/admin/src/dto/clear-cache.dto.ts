import { IsOptional, IsString } from 'class-validator';

export class ClearCacheDto {
    @IsOptional()
    @IsString()
    keyPattern?: string;
}
