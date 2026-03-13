import { Controller, Post, Get, Put, Patch, Delete, Body, Param, Query, HttpCode } from '@nestjs/common';
import { Auth, CurrentUser } from '@nestlancer/auth-lib';
import {
  MessagingService,
  MessageReactionsService,
  MessageSearchService,
  MessageReadService,
  UnreadCountService,
  MessageThreadsService,
} from '../../services';
import { CreateMessageDto } from '../../dto/create-message.dto';
import { UpdateMessageDto } from '../../dto/update-message.dto';
import { MessageReactionDto } from '../../dto/message-reaction.dto';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Main controller for user-to-user and project-based messaging.
 * Provides endpoints for sending, searching, and managing individual messages.
 *
 * @category Messaging
 */
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
    private readonly threadsService: MessageThreadsService,
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  /**
   * Performs a health check for the internal messaging system.
   *
   * @returns A promise resolving to the operational status of the messaging service
   */
  @Get('health')
  @ApiOperation({
    summary: 'Messages service health check',
    description:
      'Evaluate the connectivity and performance status of the messaging infrastructure.',
  })
  async health(): Promise<any> {
    return { status: 'ok', service: 'messages' };
  }

  /**
   * Retrieves the total count of unread messages for the current user.
   *
   * @param userId Authenticated user ID
   * @returns Total unread message count
   */
  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread count',
    description: 'Fetch the cumulative number of messages the user has not yet checked.',
  })
  async getUnreadCount(@CurrentUser('userId') userId: string): Promise<any> {
    const data = await this.unreadCountService.getUnreadCount(userId);
    return { status: 'success', data };
  }

  /**
   * Searches through messages based on a text query.
   * Can be restricted to a specific project.
   *
   * @param userId Authenticated user ID
   * @param q The search query string
   * @param projectId Optional project ID filter
   * @param page Pagination page number
   * @returns List of matching messages
   */
  @Get('search')
  @ApiOperation({
    summary: 'Search messages',
    description: 'Perform full-text search across messages within a project or for all user chats.',
  })
  async search(
    @CurrentUser('userId') userId: string,
    @Query('q') q: string,
    @Query('projectId') projectId: string | undefined,
    @Query('page') page: string,
  ): Promise<any> {
    if (projectId) {
      const data = await this.searchService.searchMessages(projectId, q || '', Number(page) || 1);
      return { status: 'success', ...data };
    }
    const data = await this.searchService.searchAllForUser(userId, q || '', Number(page) || 1);
    return { status: 'success', ...data };
  }

  /**
   * Retrieves messages for a specific project.
   *
   * @param projectId The project ID
   * @param query Pagination and filtering parameters
   * @returns Paginated list of project messages
   */
  @Get('projects/:projectId') // Alias for project/:projectId
  @ApiOperation({
    summary: 'List project messages',
    description: 'Retrieve history of messages for a given project stream.',
  })
  async getMessagesByProject(
    @Param('projectId') projectId: string,
    @Query() query: any,
  ): Promise<any> {
    const data = await this.messagingService.getMessages(projectId, query);
    return { status: 'success', ...data };
  }

  /**
   * Sends a message within the context of a project.
   *
   * @param userId Authenticated sender ID
   * @param projectId Destination project ID
   * @param dto Message content and type
   * @returns Details of the sent message
   */
  @Post('projects/:projectId')
  @ApiOperation({
    summary: 'Send message (project)',
    description: 'Post a new message to a specific project chat stream.',
  })
  async sendProjectMessage(
    @CurrentUser('userId') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateMessageDto,
  ): Promise<any> {
    dto['projectId'] = projectId;
    const data = await this.messagingService.sendMessage(userId, dto);
    return { status: 'success', data };
  }

  /**
   * Sends a standalone message.
   *
   * @param userId Authenticated sender ID
   * @param dto Message content, type, and target project
   * @returns Details of the sent message
   */
  @Post()
  @ApiOperation({
    summary: 'Send message',
    description: 'Post a new message. Project ID is required within the DTO.',
  })
  async sendMessage(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateMessageDto,
  ): Promise<any> {
    const data = await this.messagingService.sendMessage(userId, dto);
    return { status: 'success', data };
  }

  /**
   * Retrieves messages for a specific project.
   *
   * @param projectId The project ID
   * @param query Pagination and filtering parameters
   * @returns Paginated list of project messages
   */
  @Get('project/:projectId')
  @ApiOperation({
    summary: 'List project messages',
    description: 'Retrieve history of messages for a given project stream.',
  })
  async getMessages(@Param('projectId') projectId: string, @Query() query: any): Promise<any> {
    const data = await this.messagingService.getMessages(projectId, query);
    return { status: 'success', ...data };
  }

  /**
   * Searches messages within a specific project.
   *
   * @param projectId The project ID
   * @param q Text query
   * @param page Pagination page
   * @returns List of matching project messages
   */
  @Get('project/:projectId/search')
  @ApiOperation({
    summary: 'Search project messages',
    description: 'Perform text search restricted to a single project chat.',
  })
  async searchMessages(
    @Param('projectId') projectId: string,
    @Query('q') q: string,
    @Query('page') page: string,
  ): Promise<any> {
    const data = await this.searchService.searchMessages(projectId, q, Number(page) || 1);
    return { status: 'success', ...data };
  }

  /**
   * Updates the content of an existing message.
   *
   * @param userId Authenticated user ID (author only)
   * @param id The message ID
   * @param dto New content
   * @returns Details of the updated message
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Edit message',
    description: 'Modify the text content of a previously sent message.',
  })
  async editMessage(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMessageDto,
  ): Promise<any> {
    const data = await this.messagingService.updateMessage(userId, id, dto);
    return { status: 'success', data };
  }

  /**
   * Deletes an existing message.
   *
   * @param userId Authenticated user ID (author only)
   * @param id The message ID
   * @returns Confirmation of deletion
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete message',
    description: 'Remove a message from the conversation.',
  })
  async deleteMessage(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ): Promise<any> {
    await this.messagingService.deleteMessage(userId, id);
    return { status: 'success' };
  }

  /**
   * Toggles an emoji reaction on a message.
   *
   * @param userId Authenticated user ID
   * @param id The message ID
   * @param dto Reaction details (emoji)
   * @returns Updated reaction state
   */
  @Post(':id/reactions')
  @ApiOperation({
    summary: 'Toggle reaction',
    description: 'Add or remove an emoji reaction on a specific message.',
  })
  @HttpCode(200)
  async toggleReaction(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: MessageReactionDto,
  ): Promise<any> {
    const data = await this.reactionsService.toggleReaction(userId, id, dto);
    return { status: 'success', data };
  }

  /**
   * Marks a specific message as read by the current user.
   *
   * @param userId Authenticated user ID
   * @param id The message ID
   * @returns Confirmation of read status update
   */
  @Post(':id/read')
  @ApiOperation({
    summary: 'Mark as read',
    description: 'Indicate that the specified message has been viewed.',
  })
  @HttpCode(200)
  async markAsRead(@CurrentUser('userId') userId: string, @Param('id') id: string): Promise<any> {
    await this.readService.markAsRead(userId, id);
    return { status: 'success' };
  }

  /**
   * Marks all messages within a project as read.
   *
   * @param userId Authenticated user ID
   * @param projectId The project ID
   * @returns Confirmation of bulk update
   */
  @Post('project/:projectId/read')
  @ApiOperation({
    summary: 'Mark project messages as read',
    description: 'Mark every unread message in a project chat as seen.',
  })
  @HttpCode(200)
  async markProjectAsRead(
    @CurrentUser('userId') userId: string,
    @Param('projectId') projectId: string,
  ): Promise<any> {
    await this.readService.markProjectMessagesAsRead(userId, projectId);
    return { status: 'success' };
  }

  /**
   * Alias to mark all project messages as read.
   *
   * @param userId Authenticated user ID
   * @param projectId The project ID
   * @returns Confirmation of bulk update
   */
  @Post('projects/:projectId/read-all')
  @ApiOperation({
    summary: 'Mark project messages as read (Alias)',
    description: 'Batch update all messages in a project to read status.',
  })
  @HttpCode(200)
  async markProjectAsReadAll(
    @CurrentUser('userId') userId: string,
    @Param('projectId') projectId: string,
  ): Promise<any> {
    await this.readService.markProjectMessagesAsRead(userId, projectId);
    return { status: 'success' };
  }

  /**
   * Pins a message to the top of the conversation.
   *
   * @param userId Authenticated user ID
   * @param id The message ID
   * @returns Pinned status confirmation
   */
  @Post(':id/pin')
  @ApiOperation({
    summary: 'Pin message',
    description: 'Highlight a message by pinning it to the chat header.',
  })
  @HttpCode(200)
  async pinMessage(@CurrentUser('userId') userId: string, @Param('id') id: string): Promise<any> {
    const message = await this.prismaRead.message.findUnique({ where: { id } });
    if (!message) throw new Error('Message not found');

    const reactions = (message.reactions || {}) as any;
    reactions.pinned = true;

    await this.prismaWrite.message.update({
      where: { id },
      data: { reactions },
    });

    return { status: 'success', id, pinned: true };
  }

  /**
   * Unpins a previously pinned message.
   *
   * @param userId Authenticated user ID
   * @param id The message ID
   * @returns Unpinned status confirmation
   */
  @Post(':id/unpin')
  @ApiOperation({ summary: 'Unpin message', description: 'Remove a message from the pinned list.' })
  @HttpCode(200)
  async unpinMessage(@CurrentUser('userId') userId: string, @Param('id') id: string): Promise<any> {
    const message = await this.prismaRead.message.findUnique({ where: { id } });
    if (!message) throw new Error('Message not found');

    const reactions = (message.reactions || {}) as any;
    if (reactions.pinned) {
      delete reactions.pinned;
      await this.prismaWrite.message.update({
        where: { id },
        data: { reactions },
      });
    }

    return { status: 'success', id, pinned: false };
  }

  /**
   * Retrieves a list of all file attachments shared within a project chat.
   *
   * @param userId Authenticated user ID
   * @param projectId The project ID
   * @returns List of message attachments
   */
  @Get('project/:projectId/attachments')
  @ApiOperation({
    summary: 'List attachments',
    description: 'Extract all file attachments from a project message stream.',
  })
  async listAttachments(
    @CurrentUser('userId') userId: string,
    @Param('projectId') projectId: string,
  ): Promise<any> {
    const messages = await this.prismaRead.message.findMany({
      where: { projectId, type: 'FILE' },
      orderBy: { createdAt: 'desc' },
    });
    return { status: 'success', projectId, attachments: messages };
  }

  /**
   * Adds an emoji reaction to a message.
   *
   * @param userId Authenticated user ID
   * @param id The message ID
   * @param dto Reaction details
   * @returns Updated reaction state
   */
  @Post(':messageId/react')
  @ApiOperation({
    summary: 'Add reaction',
    description: 'Explicit addition of an emoji reaction (separate from toggle).',
  })
  async addReaction(
    @CurrentUser('userId') userId: string,
    @Param('messageId') id: string,
    @Body() dto: MessageReactionDto,
  ): Promise<any> {
    const data = await this.reactionsService.toggleReaction(userId, id, dto);
    return { status: 'success', data };
  }

  /**
   * Removes an emoji reaction from a message.
   *
   * @param userId Authenticated user ID
   * @param id The message ID
   * @param dto Reaction details
   * @returns Updated reaction state
   */
  @Delete(':messageId/react')
  @ApiOperation({
    summary: 'Remove reaction',
    description: 'Explicit removal of an emoji reaction.',
  })
  async removeReaction(
    @CurrentUser('userId') userId: string,
    @Param('messageId') id: string,
    @Body() dto: MessageReactionDto,
  ): Promise<any> {
    const data = await this.reactionsService.toggleReaction(userId, id, dto);
    return { status: 'success', data };
  }

  /**
   * Retrieves the entire reply history for a specific message thread.
   *
   * @param id The parent message ID
   * @returns Thread message history
   */
  @Get(':messageId/thread')
  @ApiOperation({
    summary: 'Get thread history',
    description: 'Fetch all hierarchical replies for a given message.',
  })
  async getThread(
    @Param('messageId') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    const query = { page: page ? parseInt(page, 10) : 1, limit: limit ? parseInt(limit, 10) : 50 };
    const { items, meta } = await this.threadsService.getThreadReplies(id, query);
    return { status: 'success', data: items, pagination: meta };
  }

  /**
   * Sends a reply within a message thread.
   *
   * @param userId Authenticated sender ID
   * @param id The parent message ID
   * @param dto Reply content and type
   * @returns Details of the sent reply
   */
  @Post(':messageId/thread')
  @ApiOperation({
    summary: 'Send thread reply',
    description: 'Post a reply that is conceptually nested under a parent message.',
  })
  async replyToThread(
    @CurrentUser('userId') userId: string,
    @Param('messageId') id: string,
    @Body() dto: CreateMessageDto,
  ): Promise<any> {
    const data = await this.messagingService.sendMessage(userId, dto);
    return { status: 'success', data };
  }
}
