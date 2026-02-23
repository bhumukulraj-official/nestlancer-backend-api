import { Controller, Get, Query } from '@nestjs/common';
import { Auth, CurrentUser } from '@nestlancer/auth-lib';
import { ConversationsService, UnreadCountService } from '../../services';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Conversations')
@ApiBearerAuth()
@Auth()
@Controller('conversations')
export class ConversationsController {
    constructor(
        private readonly conversationsService: ConversationsService,
        private readonly unreadCount: UnreadCountService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'List user conversations' })
    async getConversations(
        @CurrentUser('userId') userId: string,
        @Query() query: any,
    ) {
        const data = await this.conversationsService.getConversations(userId, query);
        return { status: 'success', ...data };
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get total unread message count' })
    async getUnreadCount(@CurrentUser('userId') userId: string) {
        const data = await this.unreadCount.getUnreadCount(userId);
        return { status: 'success', data };
    }
}
