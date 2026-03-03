import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
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
    async getAllMedia(@Query() query: QueryMediaDto) {
        return this.adminService.findAll(query);
    }

    @Get('quarantine')
    @ApiStandardResponse(Object)
    async getQuarantinedMedia(@Query() query: QueryMediaDto) {
        return this.adminService.findQuarantined(query);
    }

    @Get('storage/analytics')
    @ApiStandardResponse(Object)
    async getStorageAnalytics() {
        return this.adminService.getAnalytics();
    }

    @Get(':id')
    @ApiStandardResponse(Object)
    async getMediaDetails(@Param('id') id: string) {
        return this.adminService.findById(id);
    }

    @Post(':id/reprocess')
    @ApiStandardResponse(Object)
    async reprocessMedia(@Param('id') id: string) {
        return this.adminService.reprocess(id);
    }

    @Delete(':id')
    @ApiStandardResponse(Object)
    async deleteMedia(@Param('id') id: string) {
        return this.adminService.deleteAny(id);
    }

    @Post('quarantine/:id/release')
    @ApiStandardResponse(Object)
    async releaseQuarantinedMedia(@Param('id') id: string) {
        return this.adminService.releaseQuarantined(id);
    }
}
