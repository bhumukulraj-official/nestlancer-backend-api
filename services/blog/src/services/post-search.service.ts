import { Injectable } from '@nestjs/common';
import { PrismaReadService, ReadOnly } from '@nestlancer/database';
import { SearchPostsDto } from '../dto/search-posts.dto';

@Injectable()
export class PostSearchService {
    constructor(private readonly prismaRead: PrismaReadService) { }

    @ReadOnly()
    async search(dto: SearchPostsDto) {
        const { q } = dto;
        return this.prismaRead.blogPost.findMany({
            where: {
                status: 'PUBLISHED',
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { excerpt: { contains: q, mode: 'insensitive' } },
                    { content: { contains: q, mode: 'insensitive' } },
                ]
            },
            take: 20
        });
    }
}
