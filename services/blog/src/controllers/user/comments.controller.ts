import { UserRole } from '@nestlancer/common';
import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';
import { CommentsService } from '../../services/comments.service';
import { CreateCommentDto, UpdateCommentDto } from '../../dto/create-comment.dto';

@Controller('posts/:slug/comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Get()
    @Auth()
    listPostComments(@Param('slug') slug: string, @Query('page') page: string = '1', @Query('limit') limit: string = '20') {
        // TODO: List comments for a post (authenticated)
        return { data: [], pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total: 0, totalPages: 0 } };
    }

    @Post()
    @Auth()
    create(@Param('slug') slug: string, @Body() dto: CreateCommentDto, @Req() req: any) {
        return this.commentsService.create(slug, req.user.id, dto);
    }

    @Post(':commentId/reply')
    @Auth()
    replyToComment(@Param('slug') slug: string, @Param('commentId') commentId: string, @Body() dto: CreateCommentDto, @Req() req: any) {
        // TODO: Add parentId to CreateCommentDto to support replies
        return this.commentsService.create(slug, req.user.id, { ...dto, parentId: commentId } as any);
    }

    @Put(':commentId')
    @Auth()
    update(@Param('commentId') commentId: string, @Body() dto: UpdateCommentDto, @Req() req: any) {
        return this.commentsService.update(commentId, req.user.id, dto);
    }

    @Delete(':commentId')
    @Auth()
    remove(@Param('commentId') commentId: string, @Req() req: any) {
        return this.commentsService.softDelete(commentId, req.user.id);
    }

    @Get(':commentId/replies')
    @Auth()
    getReplies(@Param('slug') slug: string, @Param('commentId') commentId: string) {
        return { data: [] };
    }

    @Post(':commentId/report')
    @Auth()
    reportComment(@Param('slug') slug: string, @Param('commentId') commentId: string) {
        return { reported: true };
    }

    @Post(':commentId/like')
    @Auth()
    likePostComment(
        @Param('slug') slug: string,
        @Param('commentId') commentId: string,
        @Req() req: any,
    ) {
        return { status: 'success', data: { commentId, liked: true } };
    }
}

@Controller()
export class StandaloneCommentsController {
    @Get('comments/:commentId')
    @Auth()
    getCommentById(@Param('commentId') commentId: string) {
        return { status: 'success', data: { id: commentId } };
    }

    @Get('comments/:commentId/replies')
    @Auth()
    getCommentReplies(@Param('commentId') commentId: string) {
        return { status: 'success', data: [] };
    }

    @Post('comments/:commentId/reply')
    @Auth()
    replyToCommentStandalone(
        @Param('commentId') commentId: string,
        @Body() body: any,
        @Req() req: any,
    ) {
        return { status: 'success', data: { parentId: commentId, content: body.content } };
    }

    @Patch('comments/:commentId')
    @Auth()
    editComment(
        @Param('commentId') commentId: string,
        @Body() body: any,
        @Req() req: any,
    ) {
        return { status: 'success', data: { id: commentId, content: body.content } };
    }

    @Delete('comments/:commentId')
    @Auth()
    deleteComment(
        @Param('commentId') commentId: string,
        @Req() req: any,
    ) {
        return { status: 'success', message: 'Comment deleted' };
    }

    @Post('comments/:commentId/report')
    @Auth()
    reportCommentStandalone(
        @Param('commentId') commentId: string,
        @Body() body: any,
        @Req() req: any,
    ) {
        return { status: 'success', message: 'Comment reported' };
    }

    @Post('comments/:commentId/like')
    @Auth()
    likeComment(
        @Param('commentId') commentId: string,
        @Req() req: any,
    ) {
        return { status: 'success', data: { commentId, liked: true } };
    }
}
