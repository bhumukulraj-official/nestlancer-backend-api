import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ApiResponse, ResponseMetadata } from '../types/api-response.type';
import { API_VERSION } from '../constants/app.constants';

/**
 * Wraps all successful responses in standard API envelope per 100-api-standards.
 */
@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    context.switchToHttp().getResponse<Response>();

    const metadata: ResponseMetadata = {
      timestamp: new Date().toISOString(),
      requestId: (request.headers['x-correlation-id'] as string) || '',
      version: `v${API_VERSION.replace('v', '')}`,
      path: request.url,
    };

    return next.handle().pipe(
      map((data) => {
        // If the data already has our envelope shape, return as-is
        if (data && typeof data === 'object' && 'status' in data && data.status === 'success') {
          return data;
        }

        return {
          status: 'success' as const,
          data,
          metadata,
        };
      }),
    );
  }
}
