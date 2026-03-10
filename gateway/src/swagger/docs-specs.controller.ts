import { Controller, Get, Param, Res, HttpStatus, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { HttpProxyService } from '../proxy/http-proxy.service';
import { SWAGGER_SERVICE_SPECS } from './swagger.config';
import { isServiceRegistered } from '../proxy/service-registry';

/** Minimal OpenAPI spec returned when a service is unreachable (keeps Swagger UI from breaking). */
function fallbackSpec(serviceName: string): object {
  return {
    openapi: '3.0.0',
    info: {
      title: `${serviceName} Service`,
      description: `Service temporarily unavailable. The ${serviceName} microservice may be starting or unreachable.`,
      version: '1.0',
    },
    paths: {},
  };
}

/**
 * Proxies OpenAPI (docs-json) specs from each microservice.
 * Used by Swagger UI's dropdown to load per-service documentation.
 * Returns a fallback spec when the service is unreachable so the UI still renders.
 */
@Controller('docs-specs')
export class DocsSpecsController {
  constructor(private readonly httpProxy: HttpProxyService) {}

  @Get(':serviceKey')
  async getSpec(
    @Param('serviceKey') serviceKey: string,
    @Res() res: Response,
  ): Promise<void> {
    const spec = SWAGGER_SERVICE_SPECS.find(
      (s) => s.serviceKey === serviceKey,
    );

    if (!spec || !isServiceRegistered(serviceKey)) {
      throw new HttpException(
        { status: 'error', message: `Unknown service: ${serviceKey}` },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const data = await this.httpProxy.request(
        serviceKey,
        'GET',
        spec.docsJsonPath,
      );

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.json(data);
    } catch (error: unknown) {
      // Return fallback spec instead of 502 so Swagger UI still renders (service unreachable)
      const fallback = fallbackSpec(spec.name);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.status(HttpStatus.OK).json(fallback);
    }
  }
}
