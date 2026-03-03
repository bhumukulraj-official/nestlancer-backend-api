import { Controller, Get, Delete, Param, Query } from '@nestjs/common';
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
}
