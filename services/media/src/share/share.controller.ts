import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ShareService } from './share.service';
import { ShareMediaDto } from '../dto/share-media.dto';
import { JwtAuthGuard, CurrentUser, AuthenticatedUser } from '@nestlancer/auth-lib';
import { ApiStandardResponse } from '@nestlancer/common';

import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

/**
 * Controller for managing shared media links and permissions.
 * Provides endpoints for creating, listing, and revoking shared access to media.
 * 
 * @category Media
 */
@ApiTags('Media - Sharing')
@ApiBearerAuth()
@Controller('media')
@UseGuards(JwtAuthGuard)
export class ShareController {
    constructor(private readonly shareService: ShareService) { }

    /**
     * Lists media assets that the authenticated user has shared with others.
     * 
     * @param user The current authenticated user
     * @returns List of shared media records
     */
    @Get('shared')
    @ApiStandardResponse(Object)
    @ApiOperation({ summary: 'List shared media', description: 'Retrieve all media sharing links created by the current user.' })
    async listSharedMedia(@CurrentUser() user: AuthenticatedUser): Promise<any> {
        // TODO: List shared media for user
        return { data: [], total: 0 };
    }

    /**
     * Creates a new public or restricted sharing link for a media file.
     * 
     * @param user The current authenticated user
     * @param mediaId The media file ID to share
     * @param dto Sharing configuration (expiry, password, etc)
     * @returns Newly created sharing link details
     */
    @Post(':id/share')
    @ApiStandardResponse(Object)
    @ApiOperation({ summary: 'Create share link', description: 'Generate a secure link for external access to a media file.' })
    async createShareLink(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') mediaId: string,
        @Body() dto: ShareMediaDto,
    ): Promise<any> {
        return this.shareService.createShareLink(user.userId, mediaId, dto);
    }

    /**
     * Revokes an existing sharing link, disabling further external access.
     * 
     * @param user The current authenticated user
     * @param mediaId The media file ID
     * @returns Confirmation of revocation
     */
    @Delete(':id/share')
    @ApiStandardResponse(Object)
    @ApiOperation({ summary: 'Revoke share link', description: 'Immediately disable an active sharing link.' })
    async revokeShare(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') mediaId: string,
    ): Promise<any> {
        // TODO: Revoke media share
        return { id: mediaId, shareRevoked: true };
    }
}
