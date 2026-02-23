import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

/**
 * Logs request processing duration for observability.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const correlationId = request.headers['x-correlation-id'] || '-';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const response = context.switchToHttp().getResponse();
          this.logger.log(`${method} ${url} ${response.statusCode} ${duration}ms [${correlationId}]`);
          if (duration > 1000) {
            this.logger.warn(`Slow request: ${method} ${url} took ${duration}ms`);
          }
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          this.logger.error(`${method} ${url} ERROR ${duration}ms [${correlationId}]: ${err.message}`);
        },
      }),
    );
  }
}
