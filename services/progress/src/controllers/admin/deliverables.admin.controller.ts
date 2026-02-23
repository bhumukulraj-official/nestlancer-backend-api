import { Controller, Post, Get, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';
import { DeliverablesService } from '../../services/deliverables.service';
import { UploadDeliverableDto } from '../../dto/upload-deliverable.dto';
import { UpdateDeliverableDto } from '../../dto/update-deliverable.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin Deliverables')
@ApiBearerAuth()
@Auth('ADMIN')
@Controller('admin')
export class DeliverablesAdminController {
    constructor(private readonly deliverablesService: DeliverablesService) { }

    @Post('projects/:projectId/deliverables')
    @ApiOperation({ summary: 'Upload deliverable' })
    async uploadDeliverable(
        @Param('projectId') projectId: string,
        @Body() dto: UploadDeliverableDto,
    ) {
        const data = await this.deliverablesService.create(projectId, dto);
        return { status: 'success', data };
    }

    @Get('projects/:projectId/deliverables')
    @ApiOperation({ summary: 'List project deliverables' })
    async getProjectDeliverables(@Param('projectId') projectId: string) {
        const data = await this.deliverablesService.getProjectDeliverables(projectId);
        return { status: 'success', data };
    }

    @Patch('deliverables/:id')
    @ApiOperation({ summary: 'Update deliverable metadata' })
    async updateDeliverable(
        @Param('id') id: string,
        @Body() dto: UpdateDeliverableDto,
    ) {
        const data = await this.deliverablesService.update(id, dto);
        return { status: 'success', data };
    }

    @Delete('deliverables/:id')
    @ApiOperation({ summary: 'Delete deliverable' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteDeliverable(@Param('id') id: string) {
        await this.deliverablesService.delete(id);
        return { status: 'success' };
    }
}
