import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { UserRole, SuccessResponse } from '@nestlancer/common';
import { SuperAdminGuard } from '../../guards/super-admin.guard';

import { BackupsService } from '../../services/backups.service';
import { BackupSchedulerService } from '../../services/backup-scheduler.service';
import { CreateBackupDto } from '../../dto/create-backup.dto';
import { RestoreBackupDto } from '../../dto/restore-backup.dto';
import { UpdateBackupScheduleDto } from '../../dto/update-backup-schedule.dto';

/**
 * Controller for administrative database backup and restoration management.
 * Provides endpoints for creating, listing, downloading, and restoring database backups,
 * as well as managing the automated backup schedule.
 *
 * @category Admin
 */
@ApiTags('Admin - Backups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SuperAdminGuard)
@Roles(UserRole.ADMIN)
@Controller('backups')
export class BackupsAdminController {
  constructor(
    private readonly backupsService: BackupsService,
    private readonly schedulerService: BackupSchedulerService,
  ) {}

  /**
   * Retrieves a list of all available database backups.
   *
   * @returns Array of backup metadata objects
   */
  @Get()
  @ApiOperation({
    summary: 'List backups',
    description:
      'Fetch a list of all available database backups including their status, size, and creation date.',
  })
  @SuccessResponse('Backups retrieved')
  async list(): Promise<any> {
    return this.backupsService.findAll();
  }

  /**
   * Explicitly triggers a new database backup process.
   *
   * @param dto Backup configuration options
   * @param req Express request object for extracting the performing user's identity
   * @returns Metadata of the initiated backup
   */
  @Post()
  @ApiOperation({
    summary: 'Trigger backup',
    description: 'Manually initiate a new database backup with optional notes and configuration.',
  })
  @SuccessResponse('Backup initiated')
  async create(@Body() dto: CreateBackupDto, @Req() req: any): Promise<any> {
    return this.backupsService.createBackup(dto, req.user.sub);
  }

  /**
   * Retrieves detailed information for a specific backup by its ID.
   *
   * @param id The unique identifier of the backup
   * @returns Detailed backup metadata
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get backup details',
    description: 'Retrieve comprehensive metadata for a specific database backup.',
  })
  @SuccessResponse('Backup details retrieved')
  async get(@Param('id') id: string): Promise<any> {
    return this.backupsService.findOne(id);
  }

  /**
   * Generates a secure, temporary download URL for a specific backup file.
   *
   * @param id The unique identifier of the backup
   * @returns Object containing the pre-signed download URL
   */
  @Get(':id/download')
  @ApiOperation({
    summary: 'Download backup',
    description: 'Generate a secure, time-limited download link for a database backup file.',
  })
  @SuccessResponse('Backup download URL generated')
  async download(@Param('id') id: string): Promise<any> {
    return this.backupsService.getDownloadUrl(id);
  }

  /**
   * Initiates a database restoration process from a specified backup.
   * WARNING: This operation may overwrite existing data.
   *
   * @param id The ID of the backup to restore from
   * @param dto Restoration configuration
   * @param req Express request object for tracking
   * @returns Status of the restoration process
   */
  @Post(':id/restore')
  @ApiOperation({
    summary: 'Restore backup',
    description: 'Restore the system database to a previous state using a specific backup file.',
  })
  @SuccessResponse('Backup restore initiated')
  async restore(
    @Param('id') id: string,
    @Body() dto: RestoreBackupDto,
    @Req() req: any,
  ): Promise<any> {
    dto.backupId = id;
    return this.backupsService.restoreBackup(dto, req.user.sub);
  }

  /**
   * Retrieves the current automated backup schedule configuration.
   *
   * @returns Schedule details including frequency and retention policy
   */
  @Get('schedule')
  @ApiOperation({
    summary: 'Get backup schedule',
    description: 'Retrieve the current configuration for automated recurring database backups.',
  })
  @SuccessResponse('Schedule retrieved')
  async getSchedule(): Promise<any> {
    return this.schedulerService.getSchedule();
  }

  /**
   * Updates the automated backup schedule and retention settings.
   *
   * @param dto New schedule configuration
   * @returns Updated schedule confirmation
   */
  @Patch('schedule')
  @ApiOperation({
    summary: 'Update backup schedule',
    description:
      'Modify the frequency, timing, and retention rules for automatic database backups.',
  })
  @SuccessResponse('Schedule updated')
  async updateSchedule(@Body() dto: UpdateBackupScheduleDto): Promise<any> {
    return this.schedulerService.updateSchedule(dto);
  }
}
