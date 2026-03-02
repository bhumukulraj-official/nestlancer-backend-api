import { UserRole } from '@nestlancer/common';
import { Controller, Get, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';

@Controller('admin/comments')
@Auth(UserRole.ADMIN)
export class CommentsAdminController {
    @Get()
    getPending(@Query() query: any) {
        return [];
    }

    @Patch(':id/approve')
    approve(@Param('id') id: string) {
        return { status: 'APPROVED' };
    }

    @Patch(':id/reject')
    reject(@Param('id') id: string) {
        return { status: 'REJECTED' };
    }

    @Patch(':id/spam')
    markAsSpam(@Param('id') id: string) {
        return { status: 'SPAM' };
    }
}
