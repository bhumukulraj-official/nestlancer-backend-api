import { Controller, Get, Post, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { UserRole } from '@nestlancer/common/enums/role.enum';
import { SuccessResponse } from '@nestlancer/common/decorators/success-response.decorator';
import { SuperAdminGuard } from '../../guards/super-admin.guard';

import { AuditService } from '../../services/audit.service';
import { AuditExportService } from '../../services/audit-export.service';
import { QueryAuditDto } from '../../dto/query-audit.dto';
import { ExportAuditDto } from '../../dto/export-audit.dto';

@ApiTags('Admin - Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SuperAdminGuard)
@Roles(UserRole.ADMIN)
@Controller('audit')
export class AuditAdminController {
    constructor(
        private readonly auditService: AuditService,
        private readonly exportService: AuditExportService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'List audit logs' })
    @SuccessResponse('Logs retrieved')
    async list(@Query() query: QueryAuditDto) {
        return this.auditService.findAll(query);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Audit statistics' })
    @SuccessResponse('Statistics retrieved')
    async getStats() {
        return this.auditService.getStats();
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'User audit trail' })
    @SuccessResponse('User trail retrieved')
    async getUserTrail(@Param('userId') userId: string) {
        return this.auditService.getUserTrail(userId);
    }

    @Get('resource/:type/:id')
    @ApiOperation({ summary: 'Resource audit trail' })
    @SuccessResponse('Resource trail retrieved')
    async getResourceTrail(@Param('type') type: string, @Param('id') id: string) {
        return this.auditService.getResourceTrail(type, id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get audit entry' })
    @SuccessResponse('Audit entry retrieved')
    async get(@Param('id') id: string) {
        return this.auditService.findOne(id);
    }

    @Post('export')
    @ApiOperation({ summary: 'Export audit logs' })
    @SuccessResponse('Export started')
    async export(@Param() dto: ExportAuditDto) {
        return this.exportService.triggerExport(dto);
    }
}
