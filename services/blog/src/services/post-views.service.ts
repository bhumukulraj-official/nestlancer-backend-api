import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService, ReadOnly } from '@nestlancer/database';
import { CacheService } from '@nestlancer/cache';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostViewsService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly cacheService: CacheService,
        private readonly configService: ConfigService,
    ) { }

    async recordView(postId: string, ipHash: string, userAgent?: string, referrer?: string) {
        const debounceHours = this.configService.get<number>('blog.viewDebounceHours', 1);
        const debounceKey = `blog_view:${postId}:${ipHash}`;

        const recentlyViewed = await this.cacheService.get(debounceKey);
        if (!recentlyViewed) {
            // Actually insert into post_view and increment view count
            await this.prismaWrite.blogPost.update({
                where: { id: postId },
                data: { viewCount: { increment: 1 } },
            });
            await this.cacheService.set(debounceKey, '1', debounceHours * 3600);
        }
    }
}
