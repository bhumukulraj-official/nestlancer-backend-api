import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { getServiceConfig, isServiceRegistered } from './service-registry';

/**
 * HTTP Proxy Service
 * Forwards requests from the Gateway to downstream microservices
 */
@Injectable()
export class HttpProxyService {
  private readonly logger = new Logger(HttpProxyService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Forward a request to a downstream service
   * @param serviceName - Target service name (e.g., 'auth', 'users')
   * @param req - Express request object
   * @param res - Express response object (optional, for streaming)
   * @param pathOverride - Override the request path (optional)
   * @returns Promise with response data
   */
  async forward(
    serviceName: string,
    req: Request,
    res?: Response,
    pathOverride?: string,
  ): Promise<unknown> {
    // Validate service exists
    if (!isServiceRegistered(serviceName)) {
      this.logger.error(`Service '${serviceName}' is not registered`);
      throw new HttpException(
        {
          status: 'error',
          error: {
            code: 'GATEWAY_001',
            message: `Unknown service: ${serviceName}`,
          },
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    const serviceConfig = getServiceConfig(serviceName)!;
    const targetPath = pathOverride || this.extractServicePath(serviceName, req.path);
    const targetUrl = `${serviceConfig.url}${targetPath}`;

    this.logger.debug(`Proxying ${req.method} ${req.path} → ${targetUrl}`);

    // Prepare request config
    const config: AxiosRequestConfig = {
      method: req.method as string,
      url: targetUrl,
      headers: this.prepareHeaders(req),
      data: req.body,
      timeout: serviceConfig.timeout,
      responseType: res ? 'stream' : 'json',
      validateStatus: () => true, // Don't throw on error status codes
    };

    try {
      const response$ = this.httpService.request(config).pipe(
        catchError((error: AxiosError) => {
          this.handleProxyError(error, serviceName);
          throw error;
        }),
      );

      const response = await firstValueFrom(response$);

      // If response object provided, stream the response
      if (res) {
        res.status(response.status);
        
        // Forward response headers
        const headersToForward = ['content-type', 'x-request-id', 'x-api-version'];
        headersToForward.forEach((header) => {
          if (response.headers[header]) {
            res.setHeader(header, response.headers[header] as string);
          }
        });

        if (response.data && typeof response.data.pipe === 'function') {
          response.data.pipe(res);
        } else {
          res.json(response.data);
        }
        return;
      }

      // Return data directly
      return response.data;
    } catch (error) {
      return this.handleProxyError(error as AxiosError, serviceName);
    }
  }

  /**
   * Forward a request and return the raw Axios response
   * Useful when you need full response control
   */
  async forwardRaw(
    serviceName: string,
    req: Request,
    pathOverride?: string,
  ): Promise<{ data: unknown; status: number; headers: Record<string, unknown> }> {
    if (!isServiceRegistered(serviceName)) {
      throw new HttpException(
        {
          status: 'error',
          error: {
            code: 'GATEWAY_001',
            message: `Unknown service: ${serviceName}`,
          },
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    const serviceConfig = getServiceConfig(serviceName)!;
    const targetPath = pathOverride || this.extractServicePath(serviceName, req.path);
    const targetUrl = `${serviceConfig.url}${targetPath}`;

    const config: AxiosRequestConfig = {
      method: req.method as string,
      url: targetUrl,
      headers: this.prepareHeaders(req),
      data: req.body,
      timeout: serviceConfig.timeout,
      validateStatus: () => true,
    };

    try {
      const response = await firstValueFrom(this.httpService.request(config));
      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, unknown>,
      };
    } catch (error) {
      this.handleProxyError(error as AxiosError, serviceName);
      throw error;
    }
  }

  /**
   * Make a direct HTTP request to a service (for internal use)
   */
  async request(
    serviceName: string,
    method: string,
    path: string,
    data?: unknown,
    headers?: Record<string, string>,
  ): Promise<unknown> {
    if (!isServiceRegistered(serviceName)) {
      throw new HttpException(
        {
          status: 'error',
          error: {
            code: 'GATEWAY_001',
            message: `Unknown service: ${serviceName}`,
          },
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    const serviceConfig = getServiceConfig(serviceName)!;
    const targetUrl = `${serviceConfig.url}${path}`;

    const config: AxiosRequestConfig = {
      method: method as string,
      url: targetUrl,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      data,
      timeout: serviceConfig.timeout,
      validateStatus: () => true,
    };

    try {
      const response = await firstValueFrom(this.httpService.request(config));
      
      if (response.status >= 400) {
        throw new HttpException(response.data, response.status);
      }
      
      return response.data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.handleProxyError(error as AxiosError, serviceName);
      throw error;
    }
  }

  /**
   * Extract the service-specific path from the request
   * Removes the gateway prefix to get the downstream path
   */
  private extractServicePath(serviceName: string, originalPath: string): string {
    // The gateway prefix is /api/v1
    // For auth service: /api/v1/auth/login → /api/v1/auth/login
    // For users service: /api/v1/users/profile → /profile (users service runs at /api/v1)
    
    const gatewayPrefix = '/api/v1';
    
    if (!originalPath.startsWith(gatewayPrefix)) {
      return originalPath;
    }

    const pathWithoutGateway = originalPath.slice(gatewayPrefix.length);
    
    // Special handling for services with different base paths
    switch (serviceName) {
      case 'auth':
        // Auth service runs at /api/v1/auth
        return pathWithoutGateway;
      case 'users':
        // Users service runs at /api/v1, so remove /users prefix
        return pathWithoutGateway.replace(/^\/users/, '') || '/';
      case 'payments':
        // Payments service runs at /api/v1/payments
        return pathWithoutGateway;
      case 'webhooks':
        return pathWithoutGateway;
      case 'admin':
        return pathWithoutGateway;
      default:
        // Default: forward the path as-is
        return pathWithoutGateway;
    }
  }

  /**
   * Prepare headers for forwarding to downstream service
   */
  private prepareHeaders(req: Request): Record<string, string> {
    const headers: Record<string, string> = {};
    
    // Headers to forward
    const headersToForward = [
      'authorization',
      'content-type',
      'x-request-id',
      'x-correlation-id',
      'x-user-id',
      'x-user-role',
      'idempotency-key',
      'user-agent',
      'accept',
      'accept-language',
    ];

    headersToForward.forEach((header) => {
      const value = req.headers[header];
      if (value) {
        headers[header] = Array.isArray(value) ? value[0] : value;
      }
    });

    // Add gateway identification header
    headers['x-gateway-source'] = 'nestlancer-gateway';

    return headers;
  }

  /**
   * Handle proxy errors and convert to appropriate HTTP exceptions
   */
  private handleProxyError(error: AxiosError, serviceName: string): never {
    this.logger.error(
      `Proxy error for service '${serviceName}': ${error.message}`,
      error.stack,
    );

    // Connection refused or timeout
    if (error.code === 'ECONNREFUSED') {
      throw new HttpException(
        {
          status: 'error',
          error: {
            code: 'GATEWAY_002',
            message: `Service '${serviceName}' is unavailable`,
            details: { service: serviceName },
          },
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      throw new HttpException(
        {
          status: 'error',
          error: {
            code: 'GATEWAY_003',
            message: `Request to service '${serviceName}' timed out`,
            details: { service: serviceName },
          },
        },
        HttpStatus.GATEWAY_TIMEOUT,
      );
    }

    // If we got a response from the service, pass it through
    if (error.response) {
      const { status, data } = error.response;
      throw new HttpException(data, status);
    }

    // Unknown error
    throw new HttpException(
      {
        status: 'error',
        error: {
          code: 'GATEWAY_004',
          message: `Error communicating with service '${serviceName}'`,
          details: { service: serviceName, error: error.message },
        },
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}
