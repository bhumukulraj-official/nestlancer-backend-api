import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CdnProvider } from '../interfaces/cdn-provider.interface';
import { CloudflareInvalidationService } from './cloudflare-invalidation.service';
import { CloudFrontInvalidationService } from './cloudfront-invalidation.service';
import { BatchCollectorService } from './batch-collector.service';

@Injectable()
export class CdnWorkerService implements OnModuleInit {
    private readonly logger = new Logger(CdnWorkerService.name);
    private provider: CdnProvider;

    constructor(
        private readonly configService: ConfigService,
        private readonly cloudflareService: CloudflareInvalidationService,
        private readonly cloudfrontService: CloudFrontInvalidationService,
        private readonly batchCollector: BatchCollectorService,
    ) {
        const providerName = this.configService.get<string>('cdn.provider');
        this.provider = providerName === 'cloudfront' ? this.cloudfrontService : this.cloudflareService;
    }

    onModuleInit() {
        this.batchCollector.setFlushCallback(async (paths) => {
            await this.invalidateBatch(paths);
        });
    }

    async invalidatePath(path: string) {
        this.batchCollector.add(path);
    }

    async invalidateBatch(paths: string[]) {
        this.logger.log(`Processing batch of ${paths.length} paths`);
        try {
            const result = await this.provider.invalidate(paths);
            this.logger.log(`Successfully invalidated batch. Invalidation ID: ${result.id}`);
        } catch (error) {
            this.logger.error(`Failed to invalidate batch: ${error.message}`, error.stack);
            throw error;
        }
    }

    async purgeAll() {
        this.logger.log('Processing purge all');
        try {
            await this.provider.purgeAll();
            this.logger.log('Successfully purged all cache');
        } catch (error) {
            this.logger.error(`Failed to purge all cache: ${error.message}`, error.stack);
            throw error;
        }
    }
}
