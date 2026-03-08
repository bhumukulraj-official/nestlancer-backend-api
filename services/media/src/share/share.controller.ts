import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ShareService } from './share.service';
import { ShareMediaDto } from '../dto/share-media.dto';
import { JwtAuthGuard, CurrentUser, AuthenticatedUser } from '@nestlancer/auth-lib';
import { ApiStandardResponse } from '@nestlancer/common';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class ShareController {
    constructor(private readonly shareService: ShareService) { }

    @Get('shared')
    @ApiStandardResponse(Object)
    async listSharedMedia(@CurrentUser() user: AuthenticatedUser) {
        // TODO: List shared media for user
        return { data: [], total: 0 };
    }

    @Post(':id/share')
    @ApiStandardResponse(Object)
    async createShareLink(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') mediaId: string,
        @Body() dto: ShareMediaDto,
    ) {
        return this.shareService.createShareLink(user.userId, mediaId, dto);
    }

    @Delete(':id/share')
    @ApiStandardResponse(Object)
    async revokeShare(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') mediaId: string,
    ) {
        // TODO: Revoke media share
        return { id: mediaId, shareRevoked: true };
    }
}
