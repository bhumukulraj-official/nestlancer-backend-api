import { UserRole } from '@nestlancer/common';
import { Controller, Post, Delete, Get, Param, Req } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';
import { PostInteractionsService } from '../../services/post-interactions.service';
import { Request } from 'express';

import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

/**
 * Controller for user interactions with specific blog posts.
 * Provides endpoints for liking posts, bookmarking, and tracking shares.
 * 
 * @category Blog
 */
@ApiTags('Blog - Post Interactions')
@ApiBearerAuth()
@Controller('posts/:slug')
export class PostInteractionsController {
    constructor(private readonly interactionsService: PostInteractionsService) { }

    /**
     * Toggles a 'like' reaction on a blog post for the current user.
     * 
     * @param slug The unique URL-friendly identifier of the post
     * @param req Express request for user identification
     * @returns A promise resolving to the updated post interaction status
     */
    @Post('like')
    @Auth(UserRole.USER)
    @ApiOperation({ summary: 'Toggle like', description: 'Like or unlike a blog post.' })
    async toggleLike(@Param('slug') slug: string, @Req() req: any): Promise<any> {
        return this.interactionsService.toggleLike(slug, req.user.id);
    }

    /**
     * Adds a blog post to the user's bookmarks.
     * 
     * @param slug The unique identifier of the post
     * @param req Express request for user identification
     * @returns A promise resolving to the updated post interaction status
     */
    @Post('bookmarks')
    @Post('bookmark')
    @Auth(UserRole.USER)
    @ApiOperation({ summary: 'Bookmark post', description: 'Save a blog post to the user\'s personal bookmarks.' })
    async addBookmark(@Param('slug') slug: string, @Req() req: any): Promise<any> {
        return this.interactionsService.addBookmark(slug, req.user.id);
    }

    /**
     * Removes a blog post from the user's bookmarks.
     * 
     * @param slug The unique identifier of the post
     * @param req Express request for user identification
     * @returns A promise resolving to the updated post interaction status
     */
    @Delete('bookmarks')
    @Delete('bookmark')
    @Auth(UserRole.USER)
    @ApiOperation({ summary: 'Remove bookmark', description: 'Remove a previously saved blog post from the user\'s bookmarks.' })
    async removeBookmark(@Param('slug') slug: string, @Req() req: any): Promise<any> {
        return this.interactionsService.removeBookmark(slug, req.user.id);
    }

    /**
     * Tracks a view event for a specific blog post by an authenticated user.
     * 
     * @param slug The unique identifier of the post
     * @param req Express request context
     * @returns A promise resolving to the tracking confirmation
     */
    @Post('views')
    @Post('view')
    @Auth(UserRole.USER)
    @ApiOperation({ summary: 'Track authenticated view', description: 'Record a post view specifically for a logged-in user context.' })
    async trackView(@Param('slug') slug: string, @Req() req: any): Promise<any> {
        // TODO: Track post view for authenticated user
        return { tracked: true };
    }

    /**
     * Records a share event for a blog post.
     * 
     * @param slug The unique identifier of the post
     * @param req User context
     * @returns A promise resolving to the success confirmation
     */
    @Post('share')
    @Auth(UserRole.USER)
    @ApiOperation({ summary: 'Track share', description: 'Record that a post has been shared by the user.' })
    async trackShare(@Param('slug') slug: string, @Req() req: any): Promise<any> {
        // TODO: Track share event
        return { shared: true };
    }
}

/**
 * Controller for managing a user's personal collection of bookmarked posts.
 * 
 * @category Blog
 */
@ApiTags('Blog - Bookmarks')
@ApiBearerAuth()
@Controller('bookmarks')
export class BookmarksController {
    constructor(private readonly interactionsService: PostInteractionsService) { }

    /**
     * Retrieves all bookmarked posts for the current authenticated user.
     * 
     * @param req Express request for user identification
     * @returns A promise resolving to a paginated list of user bookmarks
     */
    @Get()
    @Auth(UserRole.USER)
    @ApiOperation({ summary: 'List bookmarked posts', description: 'Fetch all blog posts that the current user has saved to their bookmarks.' })
    async listBookmarks(@Req() req: any): Promise<any> {
        // TODO: List user bookmarks
        return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }
}


