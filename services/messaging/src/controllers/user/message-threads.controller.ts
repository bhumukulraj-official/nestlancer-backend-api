import { Controller, Get, Param, Query } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';
import { MessageThreadsService } from '../../services';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Message Threads')
@ApiBearerAuth()
@Auth()
@Controller('messages/:messageId/threads')
export class MessageThreadsController {
    constructor(private readonly threadsService: MessageThreadsService) { }

    @Get()
    @ApiOperation({ summary: 'Get replies for a message thread' })
    async getThreadReplies(
        @Param('messageId') messageId: string,
        @Query() query: any,
    ) {
        const data = await this.threadsService.getThreadReplies(messageId, query);
        return { status: 'success', ...data };
    }
}
