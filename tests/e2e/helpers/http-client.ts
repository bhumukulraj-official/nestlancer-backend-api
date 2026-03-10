/**
 * E2E HTTP Client
 *
 * Axios wrapper for making HTTP requests to the API Gateway.
 * All E2E tests should use this client instead of direct axios calls.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface HttpClientConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class E2EHttpClient {
  private client: AxiosInstance;

  constructor(config: HttpClientConfig = {}) {
    const baseURL = config.baseUrl || global.__E2E__?.apiBaseUrl || 'http://localhost:3000/api/v1';

    this.client = axios.create({
      baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...config.headers,
      },
      // Don't throw on non-2xx status codes – let tests assert the status
      validateStatus: () => true,
    });
  }

  /**
   * Set the Authorization header for subsequent requests.
   */
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear the Authorization header.
   */
  clearAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  /**
   * Set a custom header.
   */
  setHeader(key: string, value: string): void {
    this.client.defaults.headers.common[key] = value;
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  /**
   * Make a request with a specific auth token (one-shot, does not modify default headers).
   */
  async withAuth<T = any>(
    token: string,
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: any,
  ): Promise<AxiosResponse<T>> {
    const config: AxiosRequestConfig = {
      headers: { Authorization: `Bearer ${token}` },
    };

    switch (method) {
      case 'get':
        return this.client.get<T>(url, config);
      case 'post':
        return this.client.post<T>(url, data, config);
      case 'put':
        return this.client.put<T>(url, data, config);
      case 'patch':
        return this.client.patch<T>(url, data, config);
      case 'delete':
        return this.client.delete<T>(url, config);
    }
  }
}

/**
 * Create a new E2E HTTP client instance.
 */
export function createHttpClient(config?: HttpClientConfig): E2EHttpClient {
  return new E2EHttpClient(config);
}

/**
 * Create a pre-configured HTTP client with auth token.
 */
export function createAuthenticatedClient(token: string, config?: HttpClientConfig): E2EHttpClient {
  const client = new E2EHttpClient(config);
  client.setAuthToken(token);
  return client;
}
