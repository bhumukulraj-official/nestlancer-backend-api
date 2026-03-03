import { IsString, MinLength, MaxLength, IsOptional, IsUUID } from 'class-validator';

export class CreateCommentDto {
    @IsString()
    @MinLength(1)
    @MaxLength(2000)
    content: string;

    @IsOptional()
    @IsUUID()
    parentId?: string;
}

export class UpdateCommentDto {
    @IsString()
    @MinLength(1)
    @MaxLength(2000)
    content: string;
}

export class ReplyCommentDto extends UpdateCommentDto { }

export class ReportCommentDto {
    @IsString()
    @MaxLength(500)
    reason: string;
}
