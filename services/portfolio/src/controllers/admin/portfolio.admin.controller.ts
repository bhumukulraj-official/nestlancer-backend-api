import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { Auth, UserRole } from '@nestlancer/auth-lib';
import { PortfolioAdminService } from '../../services/portfolio-admin.service';
import { PortfolioAnalyticsService } from '../../services/portfolio-analytics.service';
import { PortfolioOrderingService } from '../../services/portfolio-ordering.service';
import { CreatePortfolioItemDto } from '../../dto/create-portfolio-item.dto';
import { UpdatePortfolioItemDto } from '../../dto/update-portfolio-item.dto';
import { ReorderPortfolioDto } from '../../dto/reorder-portfolio.dto';
import { BulkUpdatePortfolioDto } from '../../dto/bulk-update-portfolio.dto';
import { UpdatePrivacyDto } from '../../dto/update-privacy.dto';
import { PortfolioService } from '../../services/portfolio.service';

@Controller('admin/portfolio')
@Auth(UserRole.ADMIN)
export class PortfolioAdminController {
    constructor(
        private readonly adminService: PortfolioAdminService,
        private readonly analyticsService: PortfolioAnalyticsService,
        private readonly orderingService: PortfolioOrderingService,
        private readonly portfolioService: PortfolioService,
    ) { }

    @Get()
    findAll(@Query() query: any) {
        return this.adminService.findAll(query);
    }

    @Post()
    create(@Body() dto: CreatePortfolioItemDto) {
        return this.portfolioService.create(dto);
    }

    @Post('reorder')
    reorder(@Body() dto: ReorderPortfolioDto) {
        return this.orderingService.reorder(dto);
    }

    @Post('bulk-update')
    bulkUpdate(@Body() dto: BulkUpdatePortfolioDto) {
        return this.adminService.bulkUpdate(dto);
    }

    @Get('analytics')
    getAnalytics() {
        return this.analyticsService.getGlobalAnalytics();
    }

    @Get('analytics/:id')
    getItemAnalytics(@Param('id') id: string) {
        return this.analyticsService.getItemAnalytics(id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.adminService.findById(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdatePortfolioItemDto) {
        return this.adminService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.adminService.softDelete(id);
    }

    @Post(':id/publish')
    publish(@Param('id') id: string) {
        return this.adminService.publish(id);
    }

    @Post(':id/unpublish')
    unpublish(@Param('id') id: string) {
        return this.adminService.unpublish(id);
    }

    @Post(':id/archive')
    archive(@Param('id') id: string) {
        return this.adminService.archive(id);
    }

    @Post(':id/toggle-featured')
    toggleFeatured(@Param('id') id: string) {
        return this.adminService.toggleFeatured(id);
    }

    @Patch(':id/privacy')
    updatePrivacy(@Param('id') id: string, @Body() dto: UpdatePrivacyDto) {
        return this.adminService.updatePrivacy(id, dto);
    }

    @Post(':id/duplicate')
    duplicate(@Param('id') id: string) {
        return this.adminService.duplicate(id);
    }
}
