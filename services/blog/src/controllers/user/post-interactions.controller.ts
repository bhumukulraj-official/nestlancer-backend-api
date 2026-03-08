import { UserRole } from '@nestlancer/common';
import { Controller, Post, Delete, Get, Param, Req } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';
import { PostInteractionsService } from '../../services/post-interactions.service';
import { Request } from 'express';

@Controller('posts/:slug')
export class PostInteractionsController {
    constructor(private readonly interactionsService: PostInteractionsService) { }

    @Post('like')
    @Auth(UserRole.USER)
    toggleLike(@Param('slug') slug: string, @Req() req: any) {
        return this.interactionsService.toggleLike(slug, req.user.id);
    }

    @Post('bookmarks')
    @Auth(UserRole.USER)
    addBookmark(@Param('slug') slug: string, @Req() req: any) {
        return this.interactionsService.addBookmark(slug, req.user.id);
    }

    @Post('bookmark')
    @Auth(UserRole.USER)
    addBookmarkAlias(@Param('slug') slug: string, @Req() req: any) {
        return this.interactionsService.addBookmark(slug, req.user.id);
    }

    @Delete('bookmarks')
    @Auth(UserRole.USER)
    removeBookmark(@Param('slug') slug: string, @Req() req: any) {
        return this.interactionsService.removeBookmark(slug, req.user.id);
    }

    @Delete('bookmark')
    @Auth(UserRole.USER)
    removeBookmarkAlias(@Param('slug') slug: string, @Req() req: any) {
        return this.interactionsService.removeBookmark(slug, req.user.id);
    }

    @Post('views')
    @Auth(UserRole.USER)
    trackView(@Param('slug') slug: string, @Req() req: any) {
        // TODO: Track post view for authenticated user
        return { tracked: true };
    }

    @Post('view')
    @Auth(UserRole.USER)
    trackViewAlias(@Param('slug') slug: string, @Req() req: any) {
        return this.trackView(slug, req);
    }

    @Post('share')
    @Auth(UserRole.USER)
    trackShare(@Param('slug') slug: string, @Req() req: any) {
        // TODO: Track share event
        return { shared: true };
    }
}

@Controller('bookmarks')
export class BookmarksController {
    constructor(private readonly interactionsService: PostInteractionsService) { }

    @Get()
    @Auth(UserRole.USER)
    listBookmarks(@Req() req: any) {
        // TODO: List user bookmarks
        return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }
}

