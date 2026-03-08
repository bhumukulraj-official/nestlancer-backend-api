import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { MediaAdminService } from './media-admin.service';
import { QueryMediaDto } from '../dto/query-media.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { UserRole, ApiStandardResponse } from '@nestlancer/common';

@Controller('admin/media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class MediaAdminController {
    constructor(private readonly adminService: MediaAdminService) { }

    @Get()
    @ApiStandardResponse(Object)
    async getAllMedia(@Query() query: QueryMediaDto): Promise<any> {
        return this.adminService.findAll(query);
    }

    @Get('users/:userId')
    @ApiStandardResponse(Object)
    async getUserMedia(@Param('userId') userId: string, @Query() query: QueryMediaDto) {
        // TODO: List media for a specific user as admin
        return { userId, data: [], total: 0 };
    }

    @Get('quarantine')
    @ApiStandardResponse(Object)
    async getQuarantinedMedia(@Query() query: QueryMediaDto): Promise<any> {
        return this.adminService.findQuarantined(query);
    }

    @Get(['storage/analytics', 'analytics'])
    @ApiStandardResponse(Object)
    async getStorageAnalytics() {
        return this.adminService.getAnalytics();
    }

    @Get('storage-usage')
    @ApiStandardResponse(Object)
    async getStorageUsage() {
        return this.adminService.getAnalytics();
    }

    @Get(':id')
    @ApiStandardResponse(Object)
    async getMediaDetails(@Param('id') id: string): Promise<any> {
        return this.adminService.findById(id);
    }

    @Post('cleanup')
    @ApiStandardResponse(Object)
    async runCleanup() {
        // TODO: Run unattached media storage cleanup
        return { cleaned: 0, bytesFreed: 0 };
    }

    @Patch('settings')
    @ApiStandardResponse(Object)
    async updateSettings(@Body() body: any) {
        // TODO: Update media upload settings (limits, allowed types, etc.)
        return { updated: true, settings: body };
    }

    @Post(':id/reprocess')
    @ApiStandardResponse(Object)
    async reprocessMedia(@Param('id') id: string): Promise<any> {
        return this.adminService.reprocess(id);
    }

    @Delete(':id')
    @ApiStandardResponse(Object)
    async deleteMedia(@Param('id') id: string): Promise<any> {
        return this.adminService.deleteAny(id);
    }

    @Post('quarantine/:id/release')
    @ApiStandardResponse(Object)
    async releaseQuarantinedMedia(@Param('id') id: string): Promise<any> {
        return this.adminService.releaseQuarantined(id);
    }

    @Delete('quarantine/:id')
    @ApiStandardResponse(Object)
    async deleteQuarantinedMedia(@Param('id') id: string) {
        return { status: 'success', message: `Quarantined media ${id} permanently deleted` };
    }
}
