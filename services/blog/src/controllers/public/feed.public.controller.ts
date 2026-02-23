import { Controller, Get, Res } from '@nestjs/common';
import { Public } from '@nestlancer/auth-lib';
import { Cacheable } from '@nestlancer/cache';
import { FeedService } from '../../services/feed.service';
import { Response } from 'express';

@Controller('feed')
export class FeedPublicController {
    constructor(private readonly feedService: FeedService) { }

    @Public()
    @Get('rss')
    @Cacheable({ ttl: 3600 })
    async getRss(@Res() res: Response) {
        const rss = await this.feedService.generateRss();
        res.set('Content-Type', 'application/rss+xml');
        res.send(rss);
    }

    @Public()
    @Get('atom')
    @Cacheable({ ttl: 3600 })
    async getAtom(@Res() res: Response) {
        const atom = await this.feedService.generateAtom();
        res.set('Content-Type', 'application/atom+xml');
        res.send(atom);
    }
}
