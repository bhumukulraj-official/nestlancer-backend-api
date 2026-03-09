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

        const post = await this.prismaRead.blogPost.findUnique({ where: { slug: postSlug } });
        if (!post) throw new Error('Post not found');

        const status = isClean ? CommentStatus.APPROVED : CommentStatus.PENDING;

        const comment = await this.prismaWrite.blogComment.create({
            data: {
                content: dto.content,
                postId: post.id,
                authorId: userId,
                parentId: (dto as any).parentId || null,
                status
            }
        });

        await this.prismaWrite.outbox.create({
            data: {
                type: 'BLOG_COMMENT_CREATED',
                payload: { commentId: comment.id, postId: post.id, authorId: userId, status }
            }
        });

        return {
            id: comment.id,
            status,
        };
    }

    async update(commentId: string, userId: string, dto: UpdateCommentDto) {
        const comment = await this.prismaWrite.blogComment.findUnique({ where: { id: commentId } });
        if (!comment) throw new Error('Comment not found');
        if (comment.authorId !== userId) throw new Error('Unauthorized to edit this comment');

        const updated = await this.prismaWrite.blogComment.update({
            where: { id: commentId },
            data: { content: dto.content }
        });

        return { id: updated.id, content: updated.content };
    }

    async softDelete(commentId: string, userId: string) {
        const comment = await this.prismaWrite.blogComment.findUnique({ where: { id: commentId } });
        if (!comment) throw new Error('Comment not found');
        if (comment.authorId !== userId) throw new Error('Unauthorized to delete this comment');

        await this.prismaWrite.blogComment.delete({ where: { id: commentId } });

        return { id: commentId, deleted: true };
    }

    async createReplyByParentId(parentCommentId: string, userId: string, content: string) {
        const parent = await this.prismaRead.blogComment.findUnique({
            where: { id: parentCommentId },
            include: { post: { select: { slug: true } } },
        });
        if (!parent) throw new Error('Comment not found');
        return this.create(parent.post.slug, userId, { content, parentId: parentCommentId } as any);
    }

    async getReplies(commentId: string, postId?: string) {
        const where: any = { parentId: commentId, status: 'APPROVED' };
        if (postId) where.postId = postId;
        return this.prismaRead.blogComment.findMany({
            where,
            orderBy: { createdAt: 'asc' },
            include: { author: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
        });
    }

    async reportComment(commentId: string, userId: string, reason?: string) {
        const comment = await this.prismaRead.blogComment.findUnique({ where: { id: commentId } });
        if (!comment) throw new Error('Comment not found');
        await this.prismaWrite.outbox.create({
            data: {
                type: 'COMMENT_REPORTED',
                aggregateType: 'BlogComment',
                aggregateId: commentId,
                payload: { commentId, userId, reason: reason || null, postId: comment.postId },
            },
        });
        return { reported: true };
    }

    async likeComment(commentId: string, userId: string) {
        const comment = await this.prismaRead.blogComment.findUnique({ where: { id: commentId } });
        if (!comment) throw new Error('Comment not found');
        const newLikes = (comment.likes || 0) + 1;
        await this.prismaWrite.blogComment.update({
            where: { id: commentId },
            data: { likes: newLikes },
        });
        return { commentId, liked: true, likes: newLikes };
    }
}
