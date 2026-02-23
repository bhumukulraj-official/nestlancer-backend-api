import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class StorageHealthIndicator {
  private readonly logger = new Logger(StorageHealthIndicator.name);

  async check(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; responseTime: number; details?: Record<string, unknown> }> {
    const start = Date.now();
    try {
      // In production: actual health check for storage
      return { status: 'healthy', responseTime: Date.now() - start };
    } catch (error) {
      this.logger.error('storage health check failed:', error);
      return { status: 'unhealthy', responseTime: Date.now() - start, details: { error: String(error) } };
    }
  }
}
