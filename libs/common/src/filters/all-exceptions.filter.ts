import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseAppException } from '../exceptions/base.exception';

/**
 * Global exception filter that catches ALL exceptions and formats them
 * per 100-api-standards error response envelope.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let code: string;
    let message: string;
    let details: unknown[] | undefined;

    if (exception instanceof BaseAppException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse() as Record<string, unknown>;
      const error = errorResponse.error as Record<string, unknown>;
      code = error.code as string;
      message = error.message as string;
      details = error.details as unknown[] | undefined;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      message =
        typeof exResponse === 'string'
          ? exResponse
          : ((exResponse as Record<string, unknown>).message as string);
      code = `HTTP_${status}`;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_ERROR';
      message = 'An unexpected error occurred';
      this.logger.error(
        'Unhandled exception',
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const correlationId = (request.headers['x-correlation-id'] as string) || 'unknown';

    response.status(status).json({
      status: 'error',
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
        requestId: correlationId,
        path: request.url,
      },
    });
  }
}
