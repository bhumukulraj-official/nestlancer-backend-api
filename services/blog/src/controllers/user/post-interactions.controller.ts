import { UserRole } from '@nestlancer/common';
import { Controller, Post, Delete, Param, Req } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';
import { PostInteractionsService } from '../../services/post-interactions.service';
import { Request } from 'express';

@Controller('posts/:slug')
export class PostInteractionsController {
    constructor(private readonly interactionsService: PostInteractionsService) { }

    @Post('like')
    @Auth(UserRole.USER) // Using standard Auth decorator assuming USER role for authenticatd
    toggleLike(@Param('slug') slug: string, @Req() req: any) {
        return this.interactionsService.toggleLike(slug, req.user.id);
    }

    @Post('bookmarks')
    @Auth(UserRole.USER)
    addBookmark(@Param('slug') slug: string, @Req() req: any) {
        return this.interactionsService.addBookmark(slug, req.user.id);
    }

    @Delete('bookmarks')
    @Auth(UserRole.USER)
    removeBookmark(@Param('slug') slug: string, @Req() req: any) {
        return this.interactionsService.removeBookmark(slug, req.user.id);
    }
}
