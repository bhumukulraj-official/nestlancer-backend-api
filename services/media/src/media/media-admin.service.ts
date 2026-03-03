import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService, ReadOnly } from '@nestlancer/database';
import { QueryMediaDto } from '../dto/query-media.dto';
import { MediaStatus } from '../interfaces/media.interface';
import { buildPrismaSkipTake, createPaginationMeta } from '@nestlancer/common';

@Injectable()
export class MediaAdminService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    @ReadOnly()
    async findAll(query: QueryMediaDto) {
        const { skip, take } = buildPrismaSkipTake(query.page, query.limit);

        const where: any = {};
        if (query.fileType) where.fileType = query.fileType;
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

    @ReadOnly()
    async getAnalytics() {
        const totalStorage = await this.prismaRead.media.aggregate({
            _sum: { size: true },
        });

        const fileCounts = await this.prismaRead.media.groupBy({
            by: ['mimeType'],
            _count: true,
        });

        return {
            totalBytes: totalStorage._sum.size || 0,
            breakdown: fileCounts,
        };
    }

    @ReadOnly()
    async findById(id: string) {
        return this.prismaRead.media.findUnique({
            where: { id },
        });
    }

    async reprocess(id: string) {
        return this.prismaWrite.media.update({
            where: { id },
            data: { status: MediaStatus.PROCESSING },
        });
    }

    async releaseQuarantined(id: string) {
        return this.prismaWrite.media.update({
            where: { id, status: MediaStatus.QUARANTINED },
            data: { status: MediaStatus.READY },
        });
    }

    async deleteAny(id: string) {
        return this.prismaWrite.media.delete({
            where: { id },
        });
    }
}
