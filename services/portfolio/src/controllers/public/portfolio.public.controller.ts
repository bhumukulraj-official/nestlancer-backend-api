import { Controller, Get, Param, Query, Post, Req, Body } from '@nestjs/common';
import { Public, ApiStandardResponse, UserRole } from '@nestlancer/common';
import { Auth } from '@nestlancer/auth-lib';
import { Cacheable } from '@nestlancer/cache';
import { PortfolioService } from '../../services/portfolio.service';
import { PortfolioCategoriesService } from '../../services/portfolio-categories.service';
import { PortfolioSearchService } from '../../services/portfolio-search.service';
import { PortfolioAnalyticsService } from '../../services/portfolio-analytics.service';
import { PortfolioLikesService } from '../../services/portfolio-likes.service';
import { QueryPortfolioDto } from '../../dto/query-portfolio.dto';
import { SearchPortfolioDto } from '../../dto/search-portfolio.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { PortfolioItemResponseDto } from '../../dto/portfolio-item-response.dto';
import { CategoryResponseDto } from '../../dto/category-response.dto';

/**
 * Controller for public-facing portfolio operations.
 */
@ApiTags('Public/Portfolio')
@Controller('portfolio')
export class PortfolioPublicController {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly categoriesService: PortfolioCategoriesService,
    private readonly searchService: PortfolioSearchService,
    private readonly analyticsService: PortfolioAnalyticsService,
    private readonly likesService: PortfolioLikesService,
  ) {}

  /**
   * Retrieves a paginated list of published portfolio items.
   * Supports complex filtering through the QueryPortfolioDto.
   *
   * @param query Filtering and pagination parameters
   * @returns A promise resolving to a paginated collection of portfolio items
   */
  @Public()
  @Get()
  @Cacheable({ ttl: 3600 })
  @ApiOperation({
    summary: 'List published portfolio items',
    description: 'Fetch all portfolio entries that are marked as published.',
  })
  @ApiStandardResponse({ type: PortfolioItemResponseDto, isArray: true })
  async list(@Query() query: QueryPortfolioDto): Promise<any> {
    return this.portfolioService.findPublished(query);
  }

  /**
   * Retrieves a curated collection of featured portfolio items.
   * These items are specifically marked for high-visibility showcase.
   *
   * @returns A promise resolving to an array of featured portfolio items
   */
  @Public()
  @Get('featured')
  @Cacheable({ ttl: 7200 })
  @ApiOperation({
    summary: 'Get featured portfolio items',
    description: 'Retrieve high-priority portfolio entries intended for the main showcase.',
  })
  @ApiStandardResponse({ type: PortfolioItemResponseDto, isArray: true })
  async getFeatured(): Promise<any> {
    return this.portfolioService.getFeatured();
  }

  /**
   * Retrieves all active categories used for portfolio organization.
   *
   * @returns A promise resolving to an array of portfolio categories
   */
  @Public()
  @Get('categories')
  @Cacheable({ ttl: 3600 })
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Fetch a complete list of active categories used to classify portfolio projects.',
  })
  @ApiStandardResponse({ type: CategoryResponseDto, isArray: true })
  async getCategories(): Promise<any> {
    return this.categoriesService.findAll();
  }

  /**
   * Aggregates and retrieves all unique tags across published portfolio entries.
   *
   * @returns A promise resolving to an array of unique tag strings
   */
  @Public()
  @Get('tags')
  @Cacheable({ ttl: 3600 })
  @ApiOperation({
    summary: 'Get all unique tags',
    description:
      'Extract a unique set of all technological and thematic tags used in published items.',
  })
  @ApiResponse({ status: 200, description: 'List of tags', type: [String] })
  async getTags(): Promise<any> {
    const items = await this.portfolioService.findPublished({} as any);
    const tagsSet = new Set<string>();
    for (const item of items.items) {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((t: any) => tagsSet.add(t));
      }
    }
    return Array.from(tagsSet);
  }

  /**
   * Executes a full-text search across portfolio titles, descriptions, and tags.
   *
   * @param query Search keywords and category filters
   * @returns A promise resolving to a paginated set of matching portfolio items
   */
  @Public()
  @Get('search')
  @ApiOperation({
    summary: 'Search portfolio items',
    description: 'Perform keyword-based search across the entire public portfolio.',
  })
  @ApiStandardResponse({ type: PortfolioItemResponseDto, isArray: true })
  async search(@Query() query: SearchPortfolioDto): Promise<any> {
    return this.searchService.search(query);
  }

  /**
   * Evaluates the operational status of the Portfolio service.
   *
   * @returns A promise resolving to the service health metadata
   */
  @Public()
  @Get('health')
  @ApiOperation({
    summary: 'Service health check',
    description: 'Confirm the availability and health of the portfolio microservice.',
  })
  @ApiResponse({ status: 200, description: 'Service is operational' })
  async health(): Promise<any> {
    return { status: 'ok', service: 'portfolio' };
  }

  /**
   * Retrieves detailed information for a specific portfolio item by ID or slug.
   * Also tracks view analytics.
   */
  @Public()
  @Get(':idOrSlug')
  @Cacheable({ ttl: 1800 })
  @ApiOperation({ summary: 'Get portfolio item details' })
  @ApiParam({ name: 'idOrSlug', description: 'Item UUID or URL slug' })
  @ApiStandardResponse({ type: PortfolioItemResponseDto })
  async getDetail(@Param('idOrSlug') idOrSlug: string, @Req() req: any) {
    const item = await this.portfolioService.findByIdOrSlug(idOrSlug);
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    const ipHash = Buffer.from(ip).toString('base64');
    await this.analyticsService.trackView(item.id, ipHash);
    return item;
  }

  /**
   * Toggles a 'like' on a portfolio item.
   * Requires authentication: unauthenticated calls receive 401.
   */
  @Post(':id/like')
  @Auth(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle like on portfolio item' })
  @ApiParam({ name: 'id', description: 'Portfolio item ID' })
  @ApiResponse({ status: 200, description: 'Like toggled successfully' })
  async toggleLike(@Param('id') id: string, @Req() req: any) {
    const ipHash = Buffer.from(req.ip || 'unknown').toString('base64');
    return this.likesService.toggleLike(id, req.user?.id, ipHash);
  }
}
