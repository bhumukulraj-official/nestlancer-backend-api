import { Injectable } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database';

@Injectable()
export class PostInteractionsService {
    constructor(private readonly prismaWrite: PrismaWriteService) { }

    async toggleLike(postSlug: string, userId: string) {
        // In a real implementation we lookup the postId by slug first or pass ID
        const post = await this.prismaWrite.blogPost.findUnique({ select: { id: true }, where: { slug: postSlug } });
        if (!post) {
            throw new Error('Post not found');
        }

        const existingId = `${post.id}:${userId}`;
        // Fake logic for PostLike toggle. This uses a pseudo-table `postLike`
        return { liked: true };
    }

    async addBookmark(postSlug: string, userId: string) {
        return { bookmarked: true };
    }

    async removeBookmark(postSlug: string, userId: string) {
        return { bookmarked: false };
    }
}
