import { Controller, Get, Post, Delete, Param, Query, Body } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';
import { PrismaReadService, PrismaWriteService } from '@nestlancer/database';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin Messages')
@ApiBearerAuth()
@Auth('ADMIN')
@Controller('admin/messages')
export class MessagesAdminController {
    constructor(
        private readonly prismaRead: PrismaReadService,
        private readonly prismaWrite: PrismaWriteService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'List all messages across platform (admin)' })
    async getAllMessages(@Query() query: any) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 50;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.prismaRead.message.findMany({
                skip, take: limit, orderBy: { createdAt: 'desc' },
                include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } }
            }),
            this.prismaRead.message.count(),
        ]);

        return { status: 'success', items, meta: { total, page, limit } };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a message forcefully (admin)' })
    async deleteMessage(@Param('id') id: string) {
        await this.prismaWrite.message.delete({ where: { id } });
        return { status: 'success' };
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get global message stats' })
    async getMessageStats() {
        // TODO: Get overall messaging statistics
        return { status: 'success', totalMessages: 0, activeChats: 0 };
    }

    @Get('analytics')
    @ApiOperation({ summary: 'Messaging analytics (documented path alias)' })
    async getMessagingAnalytics() {
        return this.getMessageStats();
    }

    @Get('conversations')
    @ApiOperation({ summary: 'List all project conversations (admin)' })
    async getAdminConversations(@Query() query: any) {
        return { status: 'success', data: [], pagination: { page: 1, limit: 20, total: 0 } };
    }

    @Get('project/:projectId')
    @ApiOperation({ summary: 'Get messages for a project (admin)' })
    async adminGetMessages(@Param('projectId') projectId: string) {
        // TODO: Admin view project messages
        return { status: 'success', projectId, messages: [] };
    }

    @Post(':id/flag')
    @ApiOperation({ summary: 'Flag a message for review (admin)' })
    async flagMessage(@Param('id') id: string) {
        // TODO: Flag a message
        return { status: 'success', id, flagged: true };
    }

    @Post('projects/:projectId/system')
    @ApiOperation({ summary: 'Broadcast system message to a project stream' })
    async broadcastSystemMessage(
        @Param('projectId') projectId: string,
        @Body() body: any,
    ) {
        return { status: 'success', data: { projectId, sent: true } };
    }

    @Get('flagged')
    @ApiOperation({ summary: 'Get flagged messages for moderation' })
    async getFlagged() {
        return { status: 'success', data: [] };
    }
}
