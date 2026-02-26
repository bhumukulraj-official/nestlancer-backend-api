import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CdnProvider, InvalidationResult } from '../interfaces/cdn-provider.interface';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';

@Injectable()
export class CloudFrontInvalidationService implements CdnProvider {
    private readonly logger = new Logger(CloudFrontInvalidationService.name);
    private readonly client: CloudFrontClient;
    private readonly distributionId: string;

    constructor(private readonly configService: ConfigService) {
        const region = this.configService.get<string>('cdn.cloudfront.region') || 'ap-south-1';
        this.distributionId = this.configService.get<string>('cdn.cloudfront.distributionId') || '';
        this.client = new CloudFrontClient({ region });
    }

    async invalidate(paths: string[]): Promise<InvalidationResult> {
        this.logger.log(`Invoked CloudFront invalidation for ${paths.length} paths`);

        try {
            const command = new CreateInvalidationCommand({
                DistributionId: this.distributionId,
                InvalidationBatch: {
                    CallerReference: `nestlancer-cdn-worker-${Date.now()}`,
                    Paths: {
                        Quantity: paths.length,
                        Items: paths,
                    },
                },
            });

            const response = await this.client.send(command);

            return {
                id: response.Invalidation?.Id || 'cf-' + Date.now(),
                status: response.Invalidation?.Status || 'pending',
                paths,
            };
        } catch (e) {
            const error = e as Error;
            this.logger.error(`CloudFront invalidation failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    async purgeAll(): Promise<void> {
        this.logger.log('Invoked CloudFront purge all (/*)');
        await this.invalidate(['/*']);
    }
}
