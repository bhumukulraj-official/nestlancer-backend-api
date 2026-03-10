import { UserRole, ApiStandardResponse } from '@nestlancer/common';
import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { PortfolioAdminService } from '../../services/portfolio-admin.service';
import { PortfolioAnalyticsService } from '../../services/portfolio-analytics.service';
import { PortfolioOrderingService } from '../../services/portfolio-ordering.service';
import { CreatePortfolioItemDto } from '../../dto/create-portfolio-item.dto';
import { UpdatePortfolioItemDto } from '../../dto/update-portfolio-item.dto';
import { ReorderPortfolioDto } from '../../dto/reorder-portfolio.dto';
import { BulkUpdatePortfolioDto } from '../../dto/bulk-update-portfolio.dto';
import { UpdatePrivacyDto } from '../../dto/update-privacy.dto';
import { PortfolioService } from '../../services/portfolio.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PortfolioItemResponseDto } from '../../dto/portfolio-item-response.dto';

/**
 * Controller for administrative management of portfolio items.
 */
@ApiTags('Admin/Portfolio')
@ApiBearerAuth()
@Controller('admin/portfolio')
@Auth(UserRole.ADMIN)
export class PortfolioAdminController {
  constructor(
    private readonly adminService: PortfolioAdminService,
    private readonly analyticsService: PortfolioAnalyticsService,
    private readonly orderingService: PortfolioOrderingService,
    private readonly portfolioService: PortfolioService,
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  /**
   * Retrieves an administrative list of all portfolio items.
   * Includes all statuses (draft, published, archived) with comprehensive filtering.
   *
   * @param query Filtering and pagination parameters
   * @returns A promise resolving to a paginated collection of all portfolio items
   */
  @Get()
  @ApiOperation({
    summary: 'List all portfolio items',
    description: 'Retrieve a global view of all portfolio entries for administrative management.',
  })
  @ApiStandardResponse({ type: PortfolioItemResponseDto, isArray: true })
  async findAll(@Query() query: any): Promise<any> {
    return this.adminService.findAll(query);
  }

  /**
   * Registers a new portfolio item into the system.
   *
   * @param dto Portfolio item configuration and content
   * @returns A promise resolving to the newly created portfolio item
   */
  @Post()
  @ApiOperation({
    summary: 'Create portfolio item',
    description: 'Initialize and save a new entry in the portfolio repository.',
  })
  @ApiStandardResponse({ type: PortfolioItemResponseDto })
  async create(@Body() dto: CreatePortfolioItemDto): Promise<any> {
    return this.portfolioService.create(dto);
  }

  /**
   * Modifies the sequential order of portfolio items for custom display sorting.
   *
   * @param dto Mapping of item IDs to their new ordinal positions
   * @returns A promise confirming the successful reordering
   */
  @Post('reorder')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reorder portfolio items',
    description: 'Update the global sorting order of portfolio items for the showcase UI.',
  })
  @ApiResponse({ status: 200, description: 'Items successfully reordered' })
  async reorder(@Body() dto: ReorderPortfolioDto): Promise<any> {
    return this.orderingService.reorder(dto);
  }

  /**
   * Performs bulk operations (publish, archive, etc.) on multiple items.
   */
  @Post('bulk-update')
  @HttpCode(200)
  @ApiOperation({ summary: 'Bulk update portfolio items' })
  @ApiResponse({ status: 200, description: 'Bulk operation completed' })
  bulkUpdate(@Body() dto: BulkUpdatePortfolioDto) {
    return this.adminService.bulkUpdate(dto);
  }

  /**
   * Retrieves aggregated administrative analytics for the entire portfolio.
   *
   * @returns A promise resolving to global portfolio performance metrics
   */
  @Get('analytics')
  @ApiOperation({
    summary: 'Get global analytics',
    description: 'Fetch system-wide statistics on views, likes, and engagement trends.',
  })
  @ApiResponse({ status: 200, description: 'Global analytics retrieved successfully' })
  async getAnalytics(): Promise<any> {
    return this.analyticsService.getGlobalAnalytics();
  }

  /**
   * Retrieves granular performance data for a specific portfolio item.
   *
   * @param id The unique identifier of the portfolio item
   * @returns A promise resolving to time-series analytics for the specified item
   */
  @Get('analytics/:id')
  @ApiOperation({
    summary: 'Get item analytics',
    description: 'Access detailed engagement history and view counts for a specific entry.',
  })
  @ApiParam({ name: 'id', description: 'Portfolio item UUID' })
  @ApiResponse({ status: 200, description: 'Item analytics retrieved successfully' })
  async getItemAnalytics(@Param('id') id: string): Promise<any> {
    return this.analyticsService.getItemAnalytics(id);
  }

  /**
   * Accesses the full administrative record for a single portfolio entry.
   *
   * @param id The unique identifier of the portfolio item
   * @returns A promise resolving to the comprehensive portfolio item details
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get portfolio item',
    description: 'Retrieve detailed metadata and content for any portfolio entry.',
  })
  @ApiParam({ name: 'id', description: 'Portfolio item UUID' })
  @ApiStandardResponse({ type: PortfolioItemResponseDto })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.adminService.findById(id);
  }

  /**
   * Modifies the properties and content of an existing portfolio item.
   *
   * @param id The unique identifier of the portfolio item
   * @param dto Partial configuration for updating the item
   * @returns A promise resolving to the updated portfolio item
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update portfolio item',
    description: 'Apply changes to the metadata, description, or media associations of an item.',
  })
  @ApiParam({ name: 'id', description: 'Portfolio item UUID' })
  @ApiStandardResponse({ type: PortfolioItemResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdatePortfolioItemDto): Promise<any> {
    return this.adminService.update(id, dto);
  }

  /**
   * Transitions a portfolio item to a removed state (soft delete).
   *
   * @param id The unique identifier of the portfolio item
   * @returns A promise confirming successful deletion
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete portfolio item',
    description: 'Deactivate and mark an entry for removal from the public repository.',
  })
  @ApiParam({ name: 'id', description: 'Portfolio item UUID' })
  @ApiResponse({ status: 200, description: 'Item successfully soft-deleted' })
  async remove(@Param('id') id: string): Promise<any> {
    return this.adminService.softDelete(id);
  }

  /**
   * Makes a portfolio item publicly visible.
   */
  @Post(':id/publish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Publish item' })
  @ApiParam({ name: 'id', description: 'Portfolio item UUID' })
  @ApiResponse({ status: 200, description: 'Item published successfully' })
  publish(@Param('id') id: string) {
    return this.adminService.publish(id);
  }

  /**
   * Hides a published portfolio item.
   */
  @Post(':id/unpublish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Unpublish item' })
  @ApiParam({ name: 'id', description: 'Portfolio item UUID' })
  @ApiResponse({ status: 200, description: 'Item unpublished' })
  unpublish(@Param('id') id: string) {
    return this.adminService.unpublish(id);
  }

  /**
   * Archives a portfolio item (moves it out of active list).
   */
  @Post(':id/archive')
  @HttpCode(200)
  @ApiOperation({ summary: 'Archive item' })
  @ApiParam({ name: 'id', description: 'Portfolio item UUID' })
  @ApiResponse({ status: 200, description: 'Item archived' })
  archive(@Param('id') id: string) {
    return this.adminService.archive(id);
  }

  /**
   * Toggles whether the item is highlighted on the user's profile.
   */
  @Post(':id/toggle-featured')
  @HttpCode(200)
  @ApiOperation({ summary: 'Toggle featured status' })
  @ApiParam({ name: 'id', description: 'Portfolio item UUID' })
  @ApiResponse({ status: 200, description: 'Featured status toggled' })
  toggleFeatured(@Param('id') id: string) {
    return this.adminService.toggleFeatured(id);
  }

  /**
   * Updates the specific visibility level (Public, Unlisted, Private).
   */
  @Patch(':id/privacy')
  @ApiOperation({ summary: 'Update privacy settings' })
  @ApiParam({ name: 'id', description: 'Portfolio item UUID' })
  @ApiResponse({ status: 200, description: 'Privacy settings updated' })
  updatePrivacy(@Param('id') id: string, @Body() dto: UpdatePrivacyDto) {
    return this.adminService.updatePrivacy(id, dto);
  }

  /**
   * Creates a copy of an existing portfolio item.
   */
  @Post(':id/duplicate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Duplicate item' })
  @ApiParam({ name: 'id', description: 'Portfolio item UUID' })
  @ApiStandardResponse({ type: PortfolioItemResponseDto })
  duplicate(@Param('id') id: string) {
    return this.adminService.duplicate(id);
  }

  /**
   * Associates media assets with the portfolio item.
   */
  @Post(':id/media')
  @ApiOperation({ summary: 'Add media assets' })
  @ApiParam({ name: 'id', description: 'Portfolio item UUID' })
  @ApiResponse({ status: 201, description: 'Media added successfully' })
  async addMedia(@Param('id') id: string, @Body() body: any) {
    const item = await this.prismaRead.portfolioItem.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!item) throw new Error('Portfolio item not found');
    const order = body.order ?? item.images.length;
    const mediaId = body.id || body.mediaId || require('crypto').randomUUID();

    const newImage = await this.prismaWrite.portfolioImage.create({
      data: {
        portfolioItemId: id,
        mediaId,
        alt: body.alt ?? null,
        caption: body.caption ?? null,
        order,
      },
    });

    return { id, mediaAdded: true, media: { id: newImage.id, mediaId, order, ...body } };
  }

  /**
   * Removes a specific media asset association.
   */
  @Delete(':id/media/:mediaId')
  @ApiOperation({ summary: 'Remove media asset' })
  @ApiParam({ name: 'id', description: 'Portfolio item UUID' })
  @ApiParam({ name: 'mediaId', description: 'Media UUID' })
  @ApiResponse({ status: 200, description: 'Media removed' })
  async removeMedia(@Param('id') id: string, @Param('mediaId') mediaId: string) {
    const item = await this.prismaRead.portfolioItem.findUnique({ where: { id } });
    if (!item) throw new Error('Portfolio item not found');

    await this.prismaWrite.portfolioImage.deleteMany({
      where: {
        portfolioItemId: id,
        OR: [{ id: mediaId }, { mediaId }],
      },
    });

    return { id, mediaRemoved: mediaId };
  }

  /**
   * Updates the display order of media assets within the item.
   */
  @Patch(':id/media/reorder')
  @ApiOperation({ summary: 'Reorder media assets' })
  @ApiParam({ name: 'id', description: 'Portfolio item UUID' })
  @ApiResponse({ status: 200, description: 'Media reordered successfully' })
  async reorderMedia(@Param('id') id: string, @Body() body: any) {
    const item = await this.prismaRead.portfolioItem.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!item) throw new Error('Portfolio item not found');

    const updates = Array.isArray(body) ? body : body.order || [];

    for (const img of item.images) {
      const update = updates.find((u: any) => u.id === img.id || u.mediaId === img.mediaId);
      if (update && update.order !== undefined) {
        await this.prismaWrite.portfolioImage.update({
          where: { id: img.id },
          data: { order: update.order },
        });
      }
    }

    const updatedImages = await this.prismaRead.portfolioImage.findMany({
      where: { portfolioItemId: id },
      orderBy: { order: 'asc' },
    });

    return { id, mediaReordered: true, images: updatedImages };
  }
}
