import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { CacheService } from '@nestlancer/cache';

@Injectable()
export class FeatureFlagsService {
    private readonly CACHE_PREFIX = 'feature_flag:';

    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly cacheService: CacheService,
    ) { }

    async findAll() {
        return this.prismaRead.featureFlag.findMany();
    }

    async findOne(flag: string) {
        const feature = await this.prismaRead.featureFlag.findUnique({ where: { flag } });
        if (!feature) throw new NotFoundException(`Feature flag ${flag} not found`);
        return feature;
    }

    async toggleFeature(flag: string, enabled: boolean) {
        const feature = await this.prismaWrite.featureFlag.upsert({
            where: { flag },
            create: { flag, enabled, description: '' },
            update: { enabled },
        });

        await this.cacheService.del(`${this.CACHE_PREFIX}${flag}`);

        // In actual implementation, we'd trigger a PUB/SUB event 
        // to all services to update their in-memory flag caches immediately.

        return feature;
    }
}
