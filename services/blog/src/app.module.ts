import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {} from '@nestlancer/common';
import { DatabaseModule } from '@nestlancer/database';
import { AuthLibModule } from '@nestlancer/auth-lib';
import { LoggerModule } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { CacheModule } from '@nestlancer/cache';
import { SearchModule } from '@nestlancer/search';
import { OutboxModule } from '@nestlancer/outbox';
import blogConfig from './config/blog.config';
import { PostsPublicController } from './controllers/public/posts.public.controller';
import {
  BlogCategoriesPublicController,
  BlogTagsPublicController,
  AuthorsPublicController,
} from './controllers/public/taxonomy.public.controller';
import { FeedPublicController } from './controllers/public/feed.public.controller';
import { PostInteractionsController } from './controllers/user/post-interactions.controller';
import {
  CommentsController,
  StandaloneCommentsController,
} from './controllers/user/comments.controller';
import { PostsAdminController } from './controllers/admin/posts.admin.controller';
import { CommentsAdminController } from './controllers/admin/comments.admin.controller';
import {
  BlogCategoriesAdminController,
  BlogTagsAdminController,
} from './controllers/admin/taxonomy.admin.controller';
import { BlogAnalyticsAdminController } from './controllers/admin/blog-analytics.admin.controller';
import { PostsService } from './services/posts.service';
import { PostPublishingService } from './services/post-publishing.service';
import { PostSchedulingService } from './services/post-scheduling.service';
import { PostInteractionsService } from './services/post-interactions.service';
import { PostSearchService } from './services/post-search.service';
import { PostViewsService } from './services/post-views.service';
import { CommentsService } from './services/comments.service';
import { CommentModerationService } from './services/comment-moderation.service';
import { CategoriesService, TagsService, AuthorsService } from './services/taxonomy.service';
import { FeedService } from './services/feed.service';
import { BlogAdminService } from './services/blog-admin.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [blogConfig],
    }),
    DatabaseModule.forRoot(),
    AuthLibModule,
    LoggerModule.forRoot(),
    MetricsModule,
    CacheModule.forRoot(),
    SearchModule.forRoot(),
    OutboxModule.forRoot(),
  ],
  controllers: [
    PostsPublicController,
    BlogCategoriesPublicController,
    BlogTagsPublicController,
    AuthorsPublicController,
    FeedPublicController,
    PostInteractionsController,
    CommentsController,
    StandaloneCommentsController,
    // BookmarksController,
    PostsAdminController,
    CommentsAdminController,
    BlogCategoriesAdminController,
    BlogTagsAdminController,
    BlogAnalyticsAdminController,
  ],
  providers: [
    PostsService,
    PostPublishingService,
    PostSchedulingService,
    // PostRevisionsService,
    PostInteractionsService,
    PostSearchService,
    PostViewsService,
    CommentsService,
    CommentModerationService,
    // CommentReactionsService,
    CategoriesService,
    TagsService,
    // BookmarksService,
    AuthorsService,
    FeedService,
    // RelatedPostsService,
    // BlogAnalyticsService,
    BlogAdminService,
  ],
})
export class AppModule {}
