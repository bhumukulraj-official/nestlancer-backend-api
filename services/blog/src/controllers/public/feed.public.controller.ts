import { Controller, Get, Res } from '@nestjs/common';
import { Public } from '@nestlancer/common';
import { Cacheable } from '@nestlancer/cache';
import { FeedService } from '../../services/feed.service';

@Controller('feed')
export class FeedPublicController {
    constructor(private readonly feedService: FeedService) { }

    @Public()
    @Get('rss')
    @Cacheable({ ttl: 3600 })
    async getRss(@Res() res: any) {
        const feed = await this.feedService.generateRss();
        res.header('Content-Type', 'application/rss+xml');
        res.send(feed);
    }

    @Public()
    @Get('atom')
    @Cacheable({ ttl: 3600 })
    async getAtom(@Res() res: any) {
        const feed = await this.feedService.generateAtom();
        res.header('Content-Type', 'application/atom+xml');
        res.send(feed);
    }
}
