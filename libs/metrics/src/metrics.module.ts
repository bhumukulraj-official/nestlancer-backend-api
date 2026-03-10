import { Module, Global } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { HttpMetricsCollector } from './collectors/http.collector';
import { CacheMetricsCollector } from './collectors/cache.collector';
import { DatabaseMetricsCollector } from './collectors/database.collector';
import { QueueMetricsCollector } from './collectors/queue.collector';
import { CustomMetricsCollector } from './collectors/custom.collector';

@Global()
@Module({
  providers: [
    MetricsService,
    HttpMetricsCollector,
    CacheMetricsCollector,
    DatabaseMetricsCollector,
    QueueMetricsCollector,
    CustomMetricsCollector,
  ],
  exports: [
    MetricsService,
    HttpMetricsCollector,
    CacheMetricsCollector,
    DatabaseMetricsCollector,
    QueueMetricsCollector,
    CustomMetricsCollector,
  ],
})
export class MetricsModule {}
