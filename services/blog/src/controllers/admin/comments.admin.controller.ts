import { UserRole } from '@nestlancer/common';
import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';

@Controller('admin/comments')
@Auth(UserRole.ADMIN)
export class CommentsAdminController {
    @Get()
    getAll(@Query() query: any) {
        return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }

    @Get('pending')
    getPendingComments(@Query('page') page: string = '1', @Query('limit') limit: string = '20') {
        // TODO: List pending/moderation comments
        return { data: [], pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total: 0, totalPages: 0 } };
    }

    @Get('reported')
    getReportedComments(@Query('page') page: string = '1', @Query('limit') limit: string = '20') {
        return { data: [], pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total: 0, totalPages: 0 } };
    }

    @Post(':id/approve')
    approveComment(@Param('id') id: string) {
        return this.approve(id);
    }

    @Patch(':id/approve')
    approve(@Param('id') id: string) {
        return { id, status: 'APPROVED' };
    }

    @Post(':id/reject')
    @Patch(':id/reject')
    reject(@Param('id') id: string) {
        return { id, status: 'REJECTED' };
    }

    @Post(':id/spam')
    @Patch(':id/spam')
    markAsSpam(@Param('id') id: string) {
        return { id, status: 'SPAM' };
    }

    @Post(':id/pin')
    pinComment(@Param('id') id: string) {
        return { id, pinned: true };
    }

    @Post(':id/unpin')
    unpinComment(@Param('id') id: string) {
        return { id, pinned: false };
    }

    @Delete(':id')
    deleteComment(@Param('id') id: string) {
        // TODO: Hard-delete or soft-delete comment
        return { id, deleted: true };
    }

    @Post(':id/reply')
    adminReply(@Param('id') id: string, @Body() body: { content: string }) {
        // TODO: Admin reply to comment
        return { parentId: id, replyId: `reply_${Date.now()}`, content: body.content };
    }
}
