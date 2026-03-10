import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService, ReadOnly } from '@nestlancer/database';
import { QueryMediaDto } from '../dto/query-media.dto';
import { MediaStatus } from '../interfaces/media.interface';
import {
  buildPrismaSkipTake,
  createPaginationMeta,
  ResourceNotFoundException,
} from '@nestlancer/common';
import { MediaStorageService } from '../storage/storage.service';

@Injectable()
export class MediaAdminService {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
    private readonly storageService: MediaStorageService,
  ) {}

  @ReadOnly()
  async findAll(query: QueryMediaDto) {
    const { skip, take } = buildPrismaSkipTake(query.page, query.limit);

    const where: any = {};
    if (query.fileType) where.mimeType = { contains: query.fileType };
    if (query.status) where.status = query.status;

    const [items, total] = await Promise.all([
      this.prismaRead.media.findMany({
        where,
        skip,
        take,
        orderBy: { [query.sort || 'createdAt']: (query as any).order || 'desc' },
      }),
      this.prismaRead.media.count({ where }),
    ]);

    return {
      data: items,
      pagination: createPaginationMeta(query.page, query.limit, total),
    };
  }

  @ReadOnly()
  async findById(id: string) {
    return this.prismaRead.media.findUnique({
      where: { id },
    });
  }

  @ReadOnly()
  async findQuarantined(query: QueryMediaDto) {
    const { skip, take } = buildPrismaSkipTake(query.page, query.limit);
    const where = { status: MediaStatus.QUARANTINED };

    const [items, total] = await Promise.all([
      this.prismaRead.media.findMany({
        where,
        skip,
        take,
        orderBy: { [query.sort || 'createdAt']: (query as any).order || 'desc' },
      }),
      this.prismaRead.media.count({ where }),
    ]);

    return {
      data: items,
      pagination: createPaginationMeta(query.page, query.limit, total),
    };
  }

  async releaseQuarantined(id: string) {
    return this.prismaWrite.media.update({
      where: { id },
      data: { status: MediaStatus.READY },
    });
  }

  async updateStatus(id: string, status: MediaStatus) {
    return this.prismaWrite.media.update({
      where: { id },
      data: { status },
    });
  }

  async deleteAny(id: string) {
    const media = await this.prismaRead.media.findUnique({
      where: { id },
    });

    if (media) {
      const metadata = media.metadata as any;
      const storageKey = metadata?.storageKey;
      if (storageKey) {
        await this.storageService.deleteFile(storageKey);
      }
    }

    return this.prismaWrite.media.delete({
      where: { id },
    });
  }

  async reprocess(id: string) {
    return this.prismaWrite.media.update({
      where: { id },
      data: { status: MediaStatus.PROCESSING },
    });
  }

  @ReadOnly()
  async getAnalytics() {
    const [totalCount, totalSize, statusCounts, mimeTypeCounts] = await Promise.all([
      this.prismaRead.media.count(),
      this.prismaRead.media.aggregate({
        _sum: { size: true },
      }),
      this.prismaRead.media.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prismaRead.media.groupBy({
        by: ['mimeType'],
        _count: true,
      }),
    ]);

    return {
      totalCount,
      totalSize: totalSize._sum.size || 0,
      byStatus: statusCounts.map((c: any) => ({
        status: c.status,
        count: c._count,
      })),
      byMimeType: mimeTypeCounts.map((c: any) => ({
        mimeType: c.mimeType,
        count: c._count,
      })),
    };
  }
}
