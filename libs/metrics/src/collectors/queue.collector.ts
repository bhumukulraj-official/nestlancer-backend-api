import { Injectable } from '@nestjs/common';
import { MetricsService } from '../metrics.service';

@Injectable()
export class QueueMetricsCollector {
  constructor(private readonly metrics: MetricsService) {}
  collect(): void { /* Collects queue metrics */ }
}
