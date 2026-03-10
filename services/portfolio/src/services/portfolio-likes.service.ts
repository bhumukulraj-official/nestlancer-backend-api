import { Injectable } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database';

@Injectable()
export class PortfolioLikesService {
  constructor(private readonly prismaWrite: PrismaWriteService) {}

  async toggleLike(portfolioItemId: string, userId?: string, ipHash?: string) {
    const identifier = userId ? { userId } : { ipHash };

    const existing = await this.prismaWrite.portfolioLike.findFirst({
      where: {
        portfolioItemId,
        ...identifier,
      },
    });

    if (existing) {
      await this.prismaWrite.$transaction([
        this.prismaWrite.portfolioLike.delete({ where: { id: existing.id } }),
        this.prismaWrite.portfolioItem.update({
          where: { id: portfolioItemId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      return { liked: false };
    } else {
      await this.prismaWrite.$transaction([
        this.prismaWrite.portfolioLike.create({
          data: {
            portfolioItemId,
            ...identifier,
          },
        }),
        this.prismaWrite.portfolioItem.update({
          where: { id: portfolioItemId },
          data: { likeCount: { increment: 1 } },
        }),
      ]);
      return { liked: true };
    }
  }
}
