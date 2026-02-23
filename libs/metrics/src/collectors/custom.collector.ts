import { Injectable } from '@nestjs/common';
import { MetricsService } from '../metrics.service';

@Injectable()
export class CustomMetricsCollector {
  constructor(private readonly metrics: MetricsService) {}
  collect(): void { /* Collects custom metrics */ }
}
