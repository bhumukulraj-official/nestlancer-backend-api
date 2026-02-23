import { Controller, Post, Get, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { Auth, CurrentUser } from '@nestlancer/auth-lib';
import { MessagingService, MessageReactionsService, MessageSearchService, MessageReadService } from '../../services';
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
    ) { }

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
}
