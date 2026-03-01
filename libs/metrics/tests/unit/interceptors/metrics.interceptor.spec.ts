import { ExecutionContext, CallHandler } from '@nestjs/common';
import { MetricsInterceptor } from '../../../src/interceptors/metrics.interceptor';
import { MetricsService } from '../../../src/metrics.service';
import { of } from 'rxjs';

describe('MetricsInterceptor', () => {
    let interceptor: MetricsInterceptor;
    let metricsService: jest.Mocked<MetricsService>;

    beforeEach(() => {
        metricsService = {
            incrementCounter: jest.fn(),
            observeHistogram: jest.fn(),
        } as unknown as jest.Mocked<MetricsService>;

        interceptor = new MetricsInterceptor(metricsService);
    });

    it('should observe response time and increment total request counter', (done) => {
        const mockRequest = { method: 'GET' };
        const mockResponse = { statusCode: 200 };
        const mockContext = {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
                getResponse: () => mockResponse
            }),
        } as unknown as ExecutionContext;

        const mockCallHandler = {
            handle: jest.fn().mockReturnValue(of('handled')),
        } as CallHandler;

        interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
            expect(metricsService.incrementCounter).toHaveBeenCalledWith(
                'nestlancer_http_requests_total',
                { method: 'GET', status: 200 }
            );
            expect(metricsService.observeHistogram).toHaveBeenCalledWith(
                'nestlancer_http_request_duration_seconds',
                expect.any(Number),
                { method: 'GET' }
            );
            done();
        });
    });
});
