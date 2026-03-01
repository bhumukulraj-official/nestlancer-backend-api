import { ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { LoggingInterceptor } from '../../../src/interceptors/logging.interceptor';
import { of, throwError } from 'rxjs';

describe('LoggingInterceptor', () => {
    let interceptor: LoggingInterceptor;

    beforeEach(() => {
        interceptor = new LoggingInterceptor();
        // Spying on logger so it doesn't pollute test output and we can assert
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should log successful requests', (done) => {
        const mockRequest = { method: 'GET', url: '/test', headers: { 'x-correlation-id': '123' } };
        const mockResponse = { statusCode: 200 };
        const mockContext = {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
                getResponse: () => mockResponse,
            }),
        } as unknown as ExecutionContext;

        const mockCallHandler = {
            handle: jest.fn().mockReturnValue(of('handled')),
        } as CallHandler;

        interceptor.intercept(mockContext, mockCallHandler).subscribe({
            next: () => {
                expect(Logger.prototype.log).toHaveBeenCalledWith(expect.stringContaining('GET /test 200'));
                expect(Logger.prototype.log).toHaveBeenCalledWith(expect.stringContaining('[123]'));
                done();
            }
        });
    });

    it('should log failed requests', (done) => {
        const mockRequest = { method: 'POST', url: '/error', headers: {} };
        const mockContext = {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
            }),
        } as unknown as ExecutionContext;

        const mockCallHandler = {
            handle: jest.fn().mockReturnValue(throwError(() => new Error('Test error'))),
        } as CallHandler;

        interceptor.intercept(mockContext, mockCallHandler).subscribe({
            error: () => {
                expect(Logger.prototype.error).toHaveBeenCalledWith(expect.stringContaining('POST /error ERROR'));
                expect(Logger.prototype.error).toHaveBeenCalledWith(expect.stringContaining('Test error'));
                done();
            }
        });
    });
});
