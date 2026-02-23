import { Controller, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { Auth, UserRole } from '@nestlancer/auth-lib';
import { CommentsService } from '../../services/comments.service';
import { CreateCommentDto, UpdateCommentDto } from '../../dto/create-comment.dto';

@Controller('posts/:slug/comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post()
    @Auth()
    create(@Param('slug') slug: string, @Body() dto: CreateCommentDto, @Req() req: any) {
        return this.commentsService.create(slug, req.user.id, dto);
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
}
