import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { HttpProxyService } from '../../../src/proxy/http-proxy.service';
import { Request, Response } from 'express';

describe('HttpProxyService', () => {
    let service: HttpProxyService;
    let httpService: jest.Mocked<HttpService>;

    const mockHttpService = {
        request: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HttpProxyService,
                { provide: HttpService, useValue: mockHttpService },
            ],
        }).compile();

        service = module.get<HttpProxyService>(HttpProxyService);
        httpService = module.get(HttpService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('forward', () => {
        it('should forward request to downstream service and return data (no stripping)', async () => {
            const mockRequest = {
                method: 'GET',
                path: '/api/v1/auth/login',
                body: {},
                headers: {},
            } as unknown as Request;

            const mockResponseData = { success: true };
            const mockAxiosResponse: AxiosResponse = {
                data: mockResponseData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as InternalAxiosRequestConfig,
            };

            httpService.request.mockReturnValue(of(mockAxiosResponse));

            const result = await service.forward('auth', mockRequest);

            expect(result).toEqual(mockResponseData);
            expect(httpService.request).toHaveBeenCalledWith(expect.objectContaining({
                url: 'http://localhost:3001/api/v1/auth/login'
            }));
        });

        it('should forward request to downstream service and strip service name from path', async () => {
            const mockRequest = {
                method: 'GET',
                path: '/api/v1/users/profile',
                body: {},
                headers: {},
            } as unknown as Request;

            const mockResponseData = { id: 1 };
            const mockAxiosResponse: AxiosResponse = {
                data: mockResponseData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as InternalAxiosRequestConfig,
            };

            httpService.request.mockReturnValue(of(mockAxiosResponse));

            const result = await service.forward('users', mockRequest);

            expect(result).toEqual(mockResponseData);
            expect(httpService.request).toHaveBeenCalledWith(expect.objectContaining({
                url: 'http://localhost:3002/api/v1/profile'
            }));
        });

        it('should throw BAD_GATEWAY for unregistered service', async () => {
            const mockRequest = {
                method: 'GET',
                path: '/some-path',
            } as unknown as Request;

            await expect(service.forward('non-existent', mockRequest)).rejects.toThrow(
                new HttpException(
                    {
                        status: 'error',
                        error: {
                            code: 'GATEWAY_001',
                            message: 'Unknown service: non-existent',
                        },
                    },
                    HttpStatus.BAD_GATEWAY,
                ),
            );
        });

        it('should handle connection refused error', async () => {
            const mockRequest = {
                method: 'GET',
                path: '/api/v1/auth/login',
                body: {},
                headers: {},
            } as unknown as Request;

            const mockError = {
                code: 'ECONNREFUSED',
                message: 'Connection refused',
            };

            httpService.request.mockReturnValue(throwError(() => mockError));

            await expect(service.forward('auth', mockRequest)).rejects.toThrow(
                new HttpException(
                    {
                        status: 'error',
                        error: {
                            code: 'GATEWAY_002',
                            message: "Service 'auth' is unavailable",
                            details: { service: 'auth' },
                        },
                    },
                    HttpStatus.BAD_GATEWAY,
                ),
            );
        });

        it('should handle timeout error', async () => {
            const mockRequest = {
                method: 'GET',
                path: '/api/v1/auth/login',
                body: {},
                headers: {},
            } as unknown as Request;

            const mockError = {
                code: 'ETIMEDOUT',
                message: 'Request timed out',
            };

            httpService.request.mockReturnValue(throwError(() => mockError));

            await expect(service.forward('auth', mockRequest)).rejects.toThrow(
                new HttpException(
                    {
                        status: 'error',
                        error: {
                            code: 'GATEWAY_003',
                            message: "Request to service 'auth' timed out",
                            details: { service: 'auth' },
                        },
                    },
                    HttpStatus.GATEWAY_TIMEOUT,
                ),
            );
        });
    });

    describe('forwardRaw', () => {
        it('should return raw response data, status, and headers', async () => {
            const mockRequest = {
                method: 'POST',
                path: '/api/v1/users/profile',
                body: { name: 'John' },
                headers: {},
            } as unknown as Request;

            const mockResponseData = { id: 1 };
            const mockHeaders = { 'content-type': 'application/json' };
            const mockAxiosResponse: AxiosResponse = {
                data: mockResponseData,
                status: 201,
                statusText: 'Created',
                headers: mockHeaders,
                config: {} as InternalAxiosRequestConfig,
            };

            httpService.request.mockReturnValue(of(mockAxiosResponse));

            const result = await service.forwardRaw('users', mockRequest);

            expect(result).toEqual({
                data: mockResponseData,
                status: 201,
                headers: mockHeaders,
            });
        });
    });

    describe('request', () => {
        it('should make direct request and return data', async () => {
            const mockResponseData = { result: 'ok' };
            const mockAxiosResponse: AxiosResponse = {
                data: mockResponseData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as InternalAxiosRequestConfig,
            };

            httpService.request.mockReturnValue(of(mockAxiosResponse));

            const result = await service.request('auth', 'GET', '/health');

            expect(result).toEqual(mockResponseData);
        });

        it('should throw HttpException if downstream returns error status', async () => {
            const mockResponseData = { error: 'Not Found' };
            const mockAxiosResponse: AxiosResponse = {
                data: mockResponseData,
                status: 404,
                statusText: 'Not Found',
                headers: {},
                config: {} as InternalAxiosRequestConfig,
            };

            httpService.request.mockReturnValue(of(mockAxiosResponse));

            await expect(service.request('auth', 'GET', '/not-found')).rejects.toThrow(
                new HttpException(mockResponseData, 404),
            );
        });
    });
});
