import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    if (req.path?.includes('/health')) return next();
    const start = process.hrtime.bigint();
    const correlationId = req.headers['x-correlation-id'] || '-';

    res.on('finish', () => {
      const duration = Number(process.hrtime.bigint() - start) / 1e6;
      this.logger.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration.toFixed(1)}ms [${correlationId}]`);
    });
    next();
  }
}
