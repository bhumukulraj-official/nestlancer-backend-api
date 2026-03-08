import { Controller, Post, Get, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { Auth, CurrentUser } from '@nestlancer/auth-lib';
import { MessagingService, MessageReactionsService, MessageSearchService, MessageReadService, UnreadCountService } from '../../services';
import { CreateMessageDto } from '../../dto/create-message.dto';
import { UpdateMessageDto } from '../../dto/update-message.dto';
import { MessageReactionDto } from '../../dto/message-reaction.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Messages')
@ApiBearerAuth()
@Auth()
@Controller('messages')
export class MessagesController {
    constructor(
        private readonly messagingService: MessagingService,
        private readonly reactionsService: MessageReactionsService,
        private readonly searchService: MessageSearchService,
        private readonly readService: MessageReadService,
        private readonly unreadCountService: UnreadCountService,
    ) { }

    @Get('health')
    @ApiOperation({ summary: 'Messaging service health check' })
    health() {
        return { status: 'ok', service: 'messages' };
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get unread message count' })
    async getUnreadCount(@CurrentUser('userId') userId: string) {
        const data = await this.unreadCountService.getUnreadCount(userId);
        return { status: 'success', data };
    }

    @Get('search')
    @ApiOperation({ summary: 'Search messages (optional projectId)' })
    async search(
        @CurrentUser('userId') userId: string,
        @Query('q') q: string,
        @Query('projectId') projectId: string | undefined,
        @Query('page') page: string,
    ) {
        if (projectId) {
            const data = await this.searchService.searchMessages(projectId, q || '', Number(page) || 1);
            return { status: 'success', ...data };
        }
        const data = await this.searchService.searchAllForUser(userId, q || '', Number(page) || 1);
        return { status: 'success', ...data };
    }

    @Get('projects/:projectId')
    @ApiOperation({ summary: 'Get messages for a project (doc path: projects plural)' })
    async getMessagesByProject(
        @Param('projectId') projectId: string,
        @Query() query: any,
    ) {
        const data = await this.messagingService.getMessages(projectId, query);
        return { status: 'success', ...data };
    }

    @Post('projects/:projectId')
    @ApiOperation({ summary: 'Send message in a project (documented path)' })
    async sendProjectMessage(
        @CurrentUser('userId') userId: string,
        @Param('projectId') projectId: string,
        @Body() dto: CreateMessageDto,
    ) {
        dto['projectId'] = projectId;
        const data = await this.messagingService.sendMessage(userId, dto);
        return { status: 'success', data };
    }

    @Post()
    @ApiOperation({ summary: 'Send a new message' })
    async sendMessage(
        @CurrentUser('userId') userId: string,
        @Body() dto: CreateMessageDto,
    ) {
        const data = await this.messagingService.sendMessage(userId, dto);
        return { status: 'success', data };
    }

    @Get('project/:projectId')
    @ApiOperation({ summary: 'Get messages for a project' })
    async getMessages(
        @Param('projectId') projectId: string,
        @Query() query: any,
    ) {
        const data = await this.messagingService.getMessages(projectId, query);
        return { status: 'success', ...data };
    }

    @Get('project/:projectId/search')
    @ApiOperation({ summary: 'Search messages in a project' })
    async searchMessages(
        @Param('projectId') projectId: string,
        @Query('q') q: string,
        @Query('page') page: string,
    ) {
        const data = await this.searchService.searchMessages(projectId, q, Number(page) || 1);
        return { status: 'success', ...data };
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Edit a message' })
    async editMessage(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
        @Body() dto: UpdateMessageDto,
    ) {
        const data = await this.messagingService.updateMessage(userId, id, dto);
        return { status: 'success', data };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a message' })
    async deleteMessage(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
    ) {
        await this.messagingService.deleteMessage(userId, id);
        return { status: 'success' };
    }

    @Post(':id/reactions')
    @ApiOperation({ summary: 'Toggle a reaction on a message' })
    async toggleReaction(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
        @Body() dto: MessageReactionDto,
    ) {
        const data = await this.reactionsService.toggleReaction(userId, id, dto);
        return { status: 'success', data };
    }

    @Post(':id/read')
    @ApiOperation({ summary: 'Mark a message as read' })
    async markAsRead(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
    ) {
        await this.readService.markAsRead(userId, id);
        return { status: 'success' };
    }

    @Post('project/:projectId/read')
    @ApiOperation({ summary: 'Mark all messages in a project as read' })
    async markProjectAsRead(
        @CurrentUser('userId') userId: string,
        @Param('projectId') projectId: string,
    ) {
        await this.readService.markProjectMessagesAsRead(userId, projectId);
        return { status: 'success' };
    }

    @Post('projects/:projectId/read-all')
    @ApiOperation({ summary: 'Mark all messages in a project as read (Alias)' })
    async markProjectAsReadAll(
        @CurrentUser('userId') userId: string,
        @Param('projectId') projectId: string,
    ) {
        await this.readService.markProjectMessagesAsRead(userId, projectId);
        return { status: 'success' };
    }

    @Post(':id/pin')
    @ApiOperation({ summary: 'Pin a message' })
    async pinMessage(@CurrentUser('userId') userId: string, @Param('id') id: string) {
        // TODO: Pin message
        return { status: 'success', id, pinned: true };
    }

    @Post(':id/unpin')
    @ApiOperation({ summary: 'Unpin a message' })
    async unpinMessage(@CurrentUser('userId') userId: string, @Param('id') id: string) {
        // TODO: Unpin message
        return { status: 'success', id, pinned: false };
    }

    @Get('project/:projectId/attachments')
    @ApiOperation({ summary: 'List attachments in a project chat' })
    async listAttachments(@CurrentUser('userId') userId: string, @Param('projectId') projectId: string) {
        // TODO: List message attachments for project
        return { status: 'success', projectId, attachments: [] };
    }

    @Post(':messageId/react')
    @ApiOperation({ summary: 'Add a reaction to a message' })
    async addReaction(
        @CurrentUser('userId') userId: string,
        @Param('messageId') id: string,
        @Body() dto: MessageReactionDto,
    ) {
        const data = await this.reactionsService.toggleReaction(userId, id, dto);
        return { status: 'success', data };
    }

    @Delete(':messageId/react')
    @ApiOperation({ summary: 'Remove a reaction from a message' })
    async removeReaction(
        @CurrentUser('userId') userId: string,
        @Param('messageId') id: string,
        @Body() dto: MessageReactionDto,
    ) {
        const data = await this.reactionsService.toggleReaction(userId, id, dto);
        return { status: 'success', data };
    }

    @Get(':messageId/thread')
    @ApiOperation({ summary: 'Get thread for a message' })
    async getThread(
        @Param('messageId') id: string,
    ) {
        return { status: 'success', data: [] };
    }

    @Post(':messageId/thread')
    @ApiOperation({ summary: 'Reply to a thread' })
    async replyToThread(
        @CurrentUser('userId') userId: string,
        @Param('messageId') id: string,
        @Body() dto: CreateMessageDto,
    ) {
        const data = await this.messagingService.sendMessage(userId, dto);
        return { status: 'success', data };
    }
}
