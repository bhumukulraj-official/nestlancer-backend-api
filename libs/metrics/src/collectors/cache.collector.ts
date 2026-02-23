import { Injectable } from '@nestjs/common';
import { MetricsService } from '../metrics.service';

@Injectable()
export class CacheMetricsCollector {
  constructor(private readonly metrics: MetricsService) {}
  collect(): void { /* Collects cache metrics */ }
}
