import { IsString, MinLength } from 'class-validator';

export class SearchPostsDto {
    @IsString()
    @MinLength(2)
    q: string;
}
