import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CdnProvider, InvalidationResult } from '../interfaces/cdn-provider.interface';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';

/**
 * Service responsible for managing CloudFront CDN invalidations.
 * Implements the CdnProvider interface to allow for generic CDN management.
 */
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

  /**
   * Creates an invalidation batch for the specified paths in CloudFront.
   *
   * @param paths - Array of URI paths to invalidate (e.g., ['/images/*', '/index.html'])
   * @returns A promise resolving to the invalidation request details
   * @throws Error if the CloudFront SDK request fails
   */
  async invalidate(paths: string[]): Promise<InvalidationResult> {
    this.logger.log(`[CDN] Requesting CloudFront invalidation for ${paths.length} paths`);

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
    } catch (e: any) {
      const error = e as Error;
      this.logger.error(`[CDN] CloudFront invalidation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Purges all content from the CDN distribution.
   * Uses the '/*' wildcard to invalidate every cached resource.
   *
   * @returns A promise that resolves when the invalidation is submitted
   */
  async purgeAll(): Promise<void> {
    this.logger.log('[CDN] Triggering full purge (/*)');
    await this.invalidate(['/*']);
  }
}
