import { Controller, Get, Param, Query } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';
import { MessageThreadsService } from '../../services';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller for managing hierarchical message threads (replies).
 * 
 * @category Messaging
 */
@ApiTags('Message Threads')
@ApiBearerAuth()
@Auth()
@Controller('messages/:messageId/threads')
export class MessageThreadsController {
    constructor(private readonly threadsService: MessageThreadsService) { }

    /**
     * Retrieves all replies associated with a specific parent message.
     * 
     * @param messageId The root message ID
     * @param query Pagination and filtering parameters
     * @returns List of messages in the thread
     */
    @Get()
    @ApiOperation({ summary: 'List thread replies', description: 'Fetch all messages that were sent in response to the specified parent message.' })
    async getThreadReplies(
        @Param('messageId') messageId: string,
        @Query() query: any,
    ): Promise<any> {
        const data = await this.threadsService.getThreadReplies(messageId, query);
        return { status: 'success', ...data };
    }
}
