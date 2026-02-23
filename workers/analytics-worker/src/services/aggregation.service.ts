import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '@nestlancer/database';

@Injectable()
export class AggregationService {
    constructor(private readonly prisma: PrismaReadService) { }

    async aggregate(
        model: string,
        groupBy: string[],
        metrics: Record<string, 'count' | 'sum' | 'avg'>,
        filters: any = {},
    ): Promise<any[]> {
        // This is a simplified helper. In a real scenario, we might use raw SQL for complex aggregations
        // or use Prisma's aggregate API if sufficient.
        const prismaModel = (this.prisma as any)[model];
        if (!prismaModel) {
            throw new Error(`Model ${model} not found in PrismaReadService`);
        }

        // For demonstration, using Prisma's groupBy API
        const _metrics: any = {};
        for (const [key, op] of Object.entries(metrics)) {
            _metrics[`_${op}`] = { [key]: true };
        }

        return await prismaModel.groupBy({
            by: groupBy,
            where: filters,
            ..._metrics,
        });
    }

    async rawQuery(query: string, params: any[] = []): Promise<any[]> {
        return await this.prisma.$queryRawUnsafe(query, ...params);
    }
}
