import { IsString, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { CommentStatus } from '../entities/comment.entity';

export class UpdateCommentDto {
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    content?: string;

    @IsOptional()
    @IsEnum(CommentStatus)
    status?: CommentStatus;

    @IsOptional()
    @IsString()
    moderationMessage?: string;
}
