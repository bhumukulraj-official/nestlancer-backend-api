import { IsString, MaxLength, IsOptional, Matches, IsEnum, IsUUID, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum ContentFormat {
    MARKDOWN = 'MARKDOWN',
    HTML = 'HTML',
}

export class SeriesDto {
    @IsString()
    name: string;

    @IsOptional()
    order?: number;
}

export class CreatePostDto {
    @IsString()
    @MaxLength(200)
    title: string;

    @IsOptional()
    @IsString()
    @Matches(/^[a-z0-9-]+$/)
    slug?: string;

    @IsString()
    @MaxLength(500)
    excerpt: string;

    @IsString()
    @MaxLength(100000)
    content: string;

    @IsEnum(ContentFormat)
    contentFormat: ContentFormat;

    @IsOptional()
    @IsUUID()
    featuredImageId?: string;

    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsUUID()
    authorId?: string;

    @IsOptional()
    seo?: any;

    @IsOptional()
    @ValidateNested()
    @Type(() => SeriesDto)
    series?: SeriesDto;

    @IsOptional()
    @IsBoolean()
    commentsEnabled?: boolean;
}
