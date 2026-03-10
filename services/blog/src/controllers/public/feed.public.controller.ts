import { Controller, Get, Res } from '@nestjs/common';
import { Public } from '@nestlancer/common';
import { Cacheable } from '@nestlancer/cache';
import { FeedService } from '../../services/feed.service';

import { ApiTags, ApiOperation } from '@nestjs/swagger';

/**
 * Controller for public RSS and Atom feeds.
 * Provides endpoints for generating syndication feeds of blog content.
 *
 * @category Blog
 */
@ApiTags('Blog - Public Feeds')
@Controller('feed')
export class FeedPublicController {
  constructor(private readonly feedService: FeedService) {}

  /**
   * Generates a structural RSS 2.0 feed representing the latest published blog posts.
   *
   * @returns A promise resolving to a valid XML RSS feed response
   */
  @Public()
  @Get('rss')
  @Cacheable({ ttl: 3600 })
  @ApiOperation({
    summary: 'Get global RSS feed',
    description: 'Retrieve the latest published blog posts in standard RSS 2.0 format.',
  })
  async getRss(@Res() res: any): Promise<any> {
    const feed = await this.feedService.generateRss();
    res.header('Content-Type', 'application/rss+xml');
    res.send(feed);
  }

  /**
   * Generates a structural Atom 1.0 feed representing the latest published blog posts.
   *
   * @returns A promise resolving to a valid XML Atom feed response
   */
  @Public()
  @Get('atom')
  @Cacheable({ ttl: 3600 })
  @ApiOperation({
    summary: 'Get global Atom feed',
    description: 'Retrieve the latest published blog posts in standard Atom format.',
  })
  async getAtom(@Res() res: any): Promise<any> {
    const feed = await this.feedService.generateAtom();
    res.header('Content-Type', 'application/atom+xml');
    res.send(feed);
  }
}
