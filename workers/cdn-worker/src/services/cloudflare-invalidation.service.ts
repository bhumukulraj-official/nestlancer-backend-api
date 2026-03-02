import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CdnProvider, InvalidationResult } from '../interfaces/cdn-provider.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CloudflareInvalidationService implements CdnProvider {
    private readonly logger = new Logger(CloudflareInvalidationService.name);
    private readonly apiToken: string;
    private readonly zoneId: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
        this.apiToken = this.configService.get<string>('cdn.cloudflare.apiToken') || '';
        this.zoneId = this.configService.get<string>('cdn.cloudflare.zoneId') || '';
    }

    async invalidate(paths: string[]): Promise<InvalidationResult> {
        this.logger.log(`Invoked Cloudflare invalidation for ${paths.length} paths`);

        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `https://api.cloudflare.com/client/v4/zones/${this.zoneId}/purge_cache`,
                    { files: paths },
                    {
                        headers: {
                            Authorization: `Bearer ${this.apiToken}`,
                            'Content-Type': 'application/json',
                        },
                    },
                ),
            );

            return {
                id: response.data.result?.id || 'cf-' + Date.now(),
                status: response.data.success ? 'completed' : 'failed',
                paths,
            };
        } catch (e: any) {
            const error = e as Error;
            this.logger.error(`Cloudflare invalidation failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    async purgeAll(): Promise<void> {
        this.logger.log('Invoked Cloudflare purge all');

        try {
            await firstValueFrom(
                this.httpService.post(
                    `https://api.cloudflare.com/client/v4/zones/${this.zoneId}/purge_cache`,
                    { purge_everything: true },
                    {
                        headers: {
                            Authorization: `Bearer ${this.apiToken}`,
                            'Content-Type': 'application/json',
                        },
                    },
                ),
            );
        } catch (e: any) {
            const error = e as Error;
            this.logger.error(`Cloudflare purge all failed: ${error.message}`, error.stack);
            throw error;
        }
    }
}
