import { Injectable } from '@nestjs/common';
import { MetricsService } from '../metrics.service';

@Injectable()
export class DatabaseMetricsCollector {
  constructor(private readonly metrics: MetricsService) {}
  collect(): void { /* Collects database metrics */ }
}
