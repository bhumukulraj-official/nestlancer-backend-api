import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { UserRole } from '@nestlancer/common/enums/role.enum';
import { SuccessResponse } from '@nestlancer/common/decorators/success-response.decorator';
import { SuperAdminGuard } from '../../guards/super-admin.guard';

import { SystemConfigService } from '../../services/system-config.service';
import { FeatureFlagsService } from '../../services/feature-flags.service';
import { MaintenanceModeService } from '../../services/maintenance-mode.service';
import { CacheManagementService } from '../../services/cache-management.service';
import { BackgroundJobsService } from '../../services/background-jobs.service';
import { SystemLogsService } from '../../services/system-logs.service';
import { AnnouncementsService } from '../../services/announcements.service';

import { UpdateSystemConfigDto } from '../../dto/update-system-config.dto';
import { ToggleFeatureDto } from '../../dto/toggle-feature.dto';
import { ToggleMaintenanceDto } from '../../dto/toggle-maintenance.dto';
import { ClearCacheDto } from '../../dto/clear-cache.dto';
import { QueryJobsDto } from '../../dto/query-jobs.dto';
import { QueryLogsDto } from '../../dto/query-logs.dto';
import { SendAnnouncementDto } from '../../dto/send-announcement.dto';

@ApiTags('Admin - System')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SuperAdminGuard)
@Roles(UserRole.ADMIN)
@Controller('system')
export class SystemAdminController {
    constructor(
        private readonly configService: SystemConfigService,
        private readonly featureFlagsService: FeatureFlagsService,
        private readonly maintenanceService: MaintenanceModeService,
        private readonly cacheService: CacheManagementService,
        private readonly jobsService: BackgroundJobsService,
        private readonly logsService: SystemLogsService,
        private readonly announcementsService: AnnouncementsService,
    ) { }

    // -- Config --
    @Get('config')
    @ApiOperation({ summary: 'Get system config' })
    @SuccessResponse('System config retrieved')
    async getConfig() {
        return this.configService.getAll();
    }

    @Patch('config')
    @ApiOperation({ summary: 'Update system config' })
    @SuccessResponse('System config updated')
    async updateConfig(@Body() dto: UpdateSystemConfigDto, @Req() req: any) {
        return this.configService.set(dto, req.user.sub);
    }

    // -- Features --
    @Get('features')
    @ApiOperation({ summary: 'List feature flags' })
    @SuccessResponse('Feature flags retrieved')
    async listFeatures() {
        return this.featureFlagsService.findAll();
    }

    @Patch('features/:flag')
    @ApiOperation({ summary: 'Toggle feature flag' })
    @SuccessResponse('Feature flag toggled')
    async toggleFeature(@Param('flag') flag: string, @Body() dto: ToggleFeatureDto) {
        return this.featureFlagsService.toggleFeature(flag, dto.enabled);
    }

    // -- Maintenance --
    @Post('maintenance')
    @ApiOperation({ summary: 'Toggle maintenance mode' })
    @SuccessResponse('Maintenance mode toggled')
    async toggleMaintenance(@Body() dto: ToggleMaintenanceDto, @Req() req: any) {
        return this.maintenanceService.toggle(dto, req.user.sub);
    }

    // -- Cache --
    @Post('cache/clear')
    @ApiOperation({ summary: 'Clear cache' })
    @SuccessResponse()
    async clearCache(@Body() dto: ClearCacheDto) {
        return this.cacheService.clearCache(dto);
    }

    @Post('cache/clear/:key')
    @ApiOperation({ summary: 'Clear specific cache key' })
    @SuccessResponse()
    async clearCacheKey(@Param('key') key: string) {
        return this.cacheService.clearCache({ keyPattern: key });
    }

    // -- Jobs --
    @Get('jobs')
    @ApiOperation({ summary: 'List background jobs' })
    @SuccessResponse('Jobs retrieved')
    async listJobs(@Query() query: QueryJobsDto) {
        return this.jobsService.findAll(query);
    }

    @Post('jobs/:id/retry')
    @ApiOperation({ summary: 'Retry failed job' })
    @SuccessResponse()
    async retryJob(@Param('id') id: string) {
        return this.jobsService.retryJob(id);
    }

    @Delete('jobs/:id')
    @ApiOperation({ summary: 'Cancel job' })
    @SuccessResponse()
    async cancelJob(@Param('id') id: string) {
        return this.jobsService.cancelJob(id);
    }

    // -- Logs --
    @Get('logs')
    @ApiOperation({ summary: 'View system logs' })
    @SuccessResponse('Logs retrieved')
    async getLogs(@Query() query: QueryLogsDto) {
        return this.logsService.queryLogs(query);
    }

    @Get('logs/download')
    @ApiOperation({ summary: 'Download logs' })
    @SuccessResponse('Log download URL generated')
    async downloadLogs(@Query() query: QueryLogsDto) {
        return this.logsService.generateDownloadLink(query);
    }

    // -- Announcements --
    @Post('announcements')
    @ApiOperation({ summary: 'Send system announcement' })
    @SuccessResponse('Announcement sent')
    async sendAnnouncement(@Body() dto: SendAnnouncementDto, @Req() req: any) {
        return this.announcementsService.send(dto, req.user.sub);
    }
}
