import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { CacheService } from '@nestlancer/cache';
import { QueuePublisherService } from '@nestlancer/queue';

@Injectable()
export class FeatureFlagsService {
  private readonly CACHE_PREFIX = 'feature_flag:';

  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
    private readonly cacheService: CacheService,
    private readonly queueService: QueuePublisherService,
  ) {}

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

    await this.queueService.publish('events', 'FEATURE_FLAG_UPDATED', {
      flag,
      enabled,
      timestamp: new Date().toISOString(),
    });

    return feature;
  }
}
