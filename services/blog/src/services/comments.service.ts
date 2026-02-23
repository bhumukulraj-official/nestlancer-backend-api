import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommentStatus } from '../entities/comment.entity';
import { CommentModerationService } from './comment-moderation.service';

@Injectable()
export class CommentsService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly moderationService: CommentModerationService,
    ) { }

    async create(postSlug: string, userId: string, dto: CreateCommentDto) {
        const isClean = await this.moderationService.checkContent(dto.content);

        // find post snippet omitted

        // Creating comment logic
        return {
            id: 'fake-comment-id',
            status: isClean ? CommentStatus.APPROVED : CommentStatus.PENDING,
        };
    }

    async update(commentId: string, userId: string, dto: UpdateCommentDto) {
        // Check if within edit window
        return { id: commentId, content: dto.content };
    }

    async softDelete(commentId: string, userId: string) {
        return { id: commentId, deleted: true };
    }
}
