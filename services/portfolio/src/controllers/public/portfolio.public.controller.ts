import { Controller, Get, Param, Query, Post, Req, Body } from '@nestjs/common';
import { Public } from '@nestlancer/auth-lib';
import { Cacheable } from '@nestlancer/cache';
import { PortfolioService } from '../../services/portfolio.service';
import { PortfolioCategoriesService } from '../../services/portfolio-categories.service';
import { PortfolioSearchService } from '../../services/portfolio-search.service';
import { PortfolioAnalyticsService } from '../../services/portfolio-analytics.service';
import { PortfolioLikesService } from '../../services/portfolio-likes.service';
import { QueryPortfolioDto } from '../../dto/query-portfolio.dto';
import { SearchPortfolioDto } from '../../dto/search-portfolio.dto';
import { Request } from 'express';

@Controller()
export class PortfolioPublicController {
    constructor(
        private readonly portfolioService: PortfolioService,
        private readonly categoriesService: PortfolioCategoriesService,
        private readonly searchService: PortfolioSearchService,
        private readonly analyticsService: PortfolioAnalyticsService,
        private readonly likesService: PortfolioLikesService,
    ) { }

    @Public()
    @Get()
    @Cacheable({ ttl: 3600 })
    list(@Query() query: QueryPortfolioDto) {
        return this.portfolioService.findPublished(query);
    }

    @Public()
    @Get('featured')
    @Cacheable({ ttl: 7200 })
    getFeatured() {
        return this.portfolioService.getFeatured();
    }

    @Public()
    @Get('categories')
    @Cacheable({ ttl: 3600 })
    getCategories() {
        return this.categoriesService.findAll();
    }

    @Public()
    @Get('tags')
    @Cacheable({ ttl: 3600 })
    getTags() {
        // In a real implementation this would fetch from a specific tags service or prisma query
        return [];
    }

    @Public()
    @Get('search')
    search(@Query() query: SearchPortfolioDto) {
        return this.searchService.search(query);
    }

    @Public()
    @Get(':idOrSlug')
    @Cacheable({ ttl: 1800 })
    async getDetail(@Param('idOrSlug') idOrSlug: string, @Req() req: Request) {
        const item = await this.portfolioService.findByIdOrSlug(idOrSlug);
        // Debounce view count
        const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
        // Let's create an ipHash (simple base64 for now, usually would be a proper hash)
        const ipHash = Buffer.from(ip).toString('base64');
        await this.analyticsService.trackView(item.id, ipHash);
        return item;
    }

    // Like specific endpoint (requires auth ideally but route is in public controller, as stated by the tracker: 
    // "Authenticated users only (despite public controller, this specific endpoint needs auth)")
    // But tracker says @Public on controller. We will omit @Public on this specific endpoint.
    // Wait, @Public() is typically applied at the controller or method level.
    // Let's not apply @Public() to this method.
    @Post(':id/like')
    async toggleLike(@Param('id') id: string, @Req() req: any) {
        const ipHash = Buffer.from(req.ip || 'unknown').toString('base64');
        return this.likesService.toggleLike(id, req.user?.id, ipHash);
    }
}
