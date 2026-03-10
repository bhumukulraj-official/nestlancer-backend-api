import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - start) / 1000;
        this.metrics.incrementCounter('nestlancer_http_requests_total', {
          method: req.method,
          status: context.switchToHttp().getResponse().statusCode,
        });
        this.metrics.observeHistogram('nestlancer_http_request_duration_seconds', duration, {
          method: req.method,
        });
      }),
    );
  }
}
