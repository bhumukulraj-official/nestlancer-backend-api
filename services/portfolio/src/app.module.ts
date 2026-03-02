import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { } from '@nestlancer/common';
import { DatabaseModule } from '@nestlancer/database';
import { AuthLibModule } from '@nestlancer/auth-lib';
import { LoggerModule } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { CacheModule } from '@nestlancer/cache';
import { SearchModule } from '@nestlancer/search';
import portfolioConfig from './config/portfolio.config';
import { PortfolioPublicController } from './controllers/public/portfolio.public.controller';
import { PortfolioAdminController } from './controllers/admin/portfolio.admin.controller';
import { PortfolioCategoriesAdminController } from './controllers/admin/portfolio-categories.admin.controller';
import { PortfolioService } from './services/portfolio.service';
import { PortfolioCategoriesService } from './services/portfolio-categories.service';
import { PortfolioSearchService } from './services/portfolio-search.service';
import { PortfolioAnalyticsService } from './services/portfolio-analytics.service';
import { PortfolioOrderingService } from './services/portfolio-ordering.service';
import { PortfolioLikesService } from './services/portfolio-likes.service';
import { PortfolioAdminService } from './services/portfolio-admin.service';

@Module({
    imports: [
        ConfigModule,
        DatabaseModule,
        AuthLibModule,
        LoggerModule,
        MetricsModule,
        CacheModule,
        SearchModule,
    ],
    controllers: [
        PortfolioPublicController,
        PortfolioAdminController,
        PortfolioCategoriesAdminController,
    ],
    providers: [
        PortfolioService,
        PortfolioCategoriesService,
        PortfolioSearchService,
        PortfolioAnalyticsService,
        PortfolioOrderingService,
        PortfolioLikesService,
        PortfolioAdminService,
    ],
})
export class AppModule { }
