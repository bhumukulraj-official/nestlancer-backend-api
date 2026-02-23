import { Injectable } from '@nestjs/common';
import { MetricsService } from '../metrics.service';

@Injectable()
export class HttpMetricsCollector {
  constructor(private readonly metrics: MetricsService) {}
  collect(): void { /* Collects http metrics */ }
}
