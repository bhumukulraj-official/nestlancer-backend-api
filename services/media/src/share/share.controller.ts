import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ShareService } from './share.service';
import { ShareMediaDto } from '../dto/share-media.dto';
import { JwtAuthGuard, CurrentUser, AuthenticatedUser } from '@nestlancer/auth-lib';
import { ApiStandardResponse } from '@nestlancer/common';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class ShareController {
    constructor(private readonly shareService: ShareService) { }

    @Post(':id/share')
    @ApiStandardResponse(Object)
    async createShareLink(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') mediaId: string,
        @Body() dto: ShareMediaDto,
    ) {
        return this.shareService.createShareLink(user.userId, mediaId, dto);
    }
}
