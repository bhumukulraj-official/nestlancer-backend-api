import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { UserRole } from '@nestlancer/common/enums/role.enum';
import { SuccessResponse } from '@nestlancer/common/decorators/success-response.decorator';
import { SuperAdminGuard } from '../../guards/super-admin.guard';

import { BackupsService } from '../../services/backups.service';
import { BackupSchedulerService } from '../../services/backup-scheduler.service';
import { CreateBackupDto } from '../../dto/create-backup.dto';
import { RestoreBackupDto } from '../../dto/restore-backup.dto';
import { UpdateBackupScheduleDto } from '../../dto/update-backup-schedule.dto';

@ApiTags('Admin - Backups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SuperAdminGuard)
@Roles(UserRole.ADMIN)
@Controller('backups')
export class BackupsAdminController {
    constructor(
        private readonly backupsService: BackupsService,
        private readonly schedulerService: BackupSchedulerService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'List backups' })
    @SuccessResponse('Backups retrieved')
    async list() {
        return this.backupsService.findAll();
    }

    @Post()
    @ApiOperation({ summary: 'Trigger backup' })
    @SuccessResponse('Backup initiated', 201)
    async create(@Body() dto: CreateBackupDto, @Req() req: any) {
        return this.backupsService.createBackup(dto, req.user.sub);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get backup details' })
    @SuccessResponse('Backup details retrieved')
    async get(@Param('id') id: string) {
        return this.backupsService.findOne(id);
    }

    @Get(':id/download')
    @ApiOperation({ summary: 'Download backup' })
    @SuccessResponse('Backup download URL generated')
    async download(@Param('id') id: string) {
        return this.backupsService.getDownloadUrl(id);
    }

    @Post(':id/restore')
    @ApiOperation({ summary: 'Restore backup' })
    @SuccessResponse('Backup restore initiated')
    async restore(@Param('id') id: string, @Body() dto: RestoreBackupDto, @Req() req: any) {
        dto.backupId = id;
        return this.backupsService.restoreBackup(dto, req.user.sub);
    }

    @Get('schedule')
    @ApiOperation({ summary: 'Get backup schedule' })
    @SuccessResponse('Schedule retrieved')
    async getSchedule() {
        return this.schedulerService.getSchedule();
    }

    @Patch('schedule')
    @ApiOperation({ summary: 'Update backup schedule' })
    @SuccessResponse('Schedule updated')
    async updateSchedule(@Body() dto: UpdateBackupScheduleDto) {
        return this.schedulerService.updateSchedule(dto);
    }
}
