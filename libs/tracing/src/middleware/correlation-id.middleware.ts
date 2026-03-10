import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v7 as uuidv7 } from 'uuid';

const API_VERSION = 'v1'; // Hardcoded to avoid circular dependency with @nestlancer/common

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['x-request-id'] as string) ||
      uuidv7();

    // Set on request for internal use
    req.headers['x-correlation-id'] = correlationId;
    req.headers['x-request-id'] = correlationId;

    // Set on response for client
    res.setHeader('X-Correlation-ID', correlationId);
    res.setHeader('X-Request-ID', correlationId);
    res.setHeader('X-API-Version', `v${API_VERSION.replace('v', '')}`);

    next();
  }
}
