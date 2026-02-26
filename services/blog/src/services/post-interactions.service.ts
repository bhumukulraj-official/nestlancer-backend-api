import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';

interface LikeResult {
    liked: boolean;
    likeCount: number;
}

interface BookmarkResult {
    bookmarked: boolean;
}

@Injectable()
export class PostInteractionsService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async toggleLike(postSlug: string, userId: string): Promise<LikeResult> {
        const post = await this.prismaRead.blogPost.findUnique({
            where: { slug: postSlug },
            select: { id: true, likeCount: true }
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        // Check if user already liked the post
        const existingLike = await this.prismaRead.postLike.findUnique({
            where: {
                postId_userId: {
                    postId: post.id,
                    userId,
                }
            }
        });

        if (existingLike) {
            // Unlike: Remove the like and decrement count
            await this.prismaWrite.$transaction([
                this.prismaWrite.postLike.delete({
                    where: { id: existingLike.id }
                }),
                this.prismaWrite.blogPost.update({
                    where: { id: post.id },
                    data: { likeCount: { decrement: 1 } }
                })
            ]);

            return {
                liked: false,
                likeCount: Math.max(0, post.likeCount - 1),
            };
        } else {
            // Like: Add the like and increment count
            await this.prismaWrite.$transaction([
                this.prismaWrite.postLike.create({
                    data: {
                        postId: post.id,
                        userId,
                    }
                }),
                this.prismaWrite.blogPost.update({
                    where: { id: post.id },
                    data: { likeCount: { increment: 1 } }
                })
            ]);

            return {
                liked: true,
                likeCount: post.likeCount + 1,
            };
        }
    }

    async addBookmark(postSlug: string, userId: string): Promise<BookmarkResult> {
        const post = await this.prismaRead.blogPost.findUnique({
            where: { slug: postSlug },
            select: { id: true }
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        // Check if bookmark already exists
        const existingBookmark = await this.prismaRead.postBookmark.findUnique({
            where: {
                postId_userId: {
                    postId: post.id,
                    userId,
                }
            }
        });

        if (existingBookmark) {
            return { bookmarked: true }; // Already bookmarked
        }

        await this.prismaWrite.postBookmark.create({
            data: {
                postId: post.id,
                userId,
            }
        });

        return { bookmarked: true };
    }

    async removeBookmark(postSlug: string, userId: string): Promise<BookmarkResult> {
        const post = await this.prismaRead.blogPost.findUnique({
            where: { slug: postSlug },
            select: { id: true }
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const existingBookmark = await this.prismaRead.postBookmark.findUnique({
            where: {
                postId_userId: {
                    postId: post.id,
                    userId,
                }
            }
        });

        if (existingBookmark) {
            await this.prismaWrite.postBookmark.delete({
                where: { id: existingBookmark.id }
            });
        }

        return { bookmarked: false };
    }

    async isLiked(postSlug: string, userId: string): Promise<boolean> {
        const post = await this.prismaRead.blogPost.findUnique({
            where: { slug: postSlug },
            select: { id: true }
        });

        if (!post) {
            return false;
        }

        const like = await this.prismaRead.postLike.findUnique({
            where: {
                postId_userId: {
                    postId: post.id,
                    userId,
                }
            }
        });

        return !!like;
    }

    async isBookmarked(postSlug: string, userId: string): Promise<boolean> {
        const post = await this.prismaRead.blogPost.findUnique({
            where: { slug: postSlug },
            select: { id: true }
        });

        if (!post) {
            return false;
        }

        const bookmark = await this.prismaRead.postBookmark.findUnique({
            where: {
                postId_userId: {
                    postId: post.id,
                    userId,
                }
            }
        });

        return !!bookmark;
    }

    async getUserBookmarks(userId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [bookmarks, total] = await Promise.all([
            this.prismaRead.postBookmark.findMany({
                where: { userId },
                include: {
                    post: {
                        select: {
                            id: true,
                            slug: true,
                            title: true,
                            excerpt: true,
                            publishedAt: true,
                            category: { select: { name: true, slug: true } },
                            author: { select: { name: true } },
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prismaRead.postBookmark.count({ where: { userId } })
        ]);

        return {
            items: bookmarks.map(b => ({
                id: b.id,
                bookmarkedAt: b.createdAt,
                post: b.post,
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }
}
